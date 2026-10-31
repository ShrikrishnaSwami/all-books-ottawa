"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type BookRig = {
  group: THREE.Group;
  coverPivot: THREE.Group;
  coverMaterial: THREE.ShaderMaterial;
  index: number;
  opened: boolean;
};

const titles = [
  ["THE HUMAN INDEX", "FICTION / 001", "#9a593d"],
  ["DUST & STARS", "SCIENCE FICTION", "#354e5b"],
  ["A MAP OF SILENCE", "LITERATURE", "#7a493d"],
  ["THE OTHER CITY", "ESSAYS / 004", "#58624b"],
  ["NIGHT ARCHIVE", "RARE EDITIONS", "#594a68"],
  ["WILD GEOGRAPHIES", "TRAVEL / 006", "#80643e"],
  ["THE LONG MEMORY", "HISTORY", "#465a4c"],
  ["BLUE HOUR", "POETRY", "#344c66"],
  ["SMALL UNIVERSES", "SHORT STORIES", "#8b6849"],
  ["LOST LANGUAGE", "FRENCH LITERATURE", "#76524b"],
  ["AFTER THE END", "SPECULATIVE", "#46515d"],
  ["PAPER WORLDS", "ART & IDEAS", "#6e6349"],
  ["THE LAST LIBRARY", "FICTION", "#65453d"],
  ["STRANGE WEATHER", "SCIENCE FICTION", "#425c59"],
];

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uCover;
  uniform float uHover;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec4 base = texture2D(uCover, vUv);
    float sweep = fract(uTime * 0.16);
    float band = 1.0 - smoothstep(0.0, 0.2, abs(vUv.x - sweep));
    float shimmer = band * uHover;
    vec3 rainbow = 0.5 + 0.5 * cos(6.2831 * (vUv.xyx + vec3(0.0, 0.33, 0.67) + uTime * 0.06));
    float edge = smoothstep(0.0, 0.12, vUv.x) * (1.0 - smoothstep(0.88, 1.0, vUv.x));
    gl_FragColor = vec4(mix(base.rgb, rainbow, shimmer * 0.32 * edge), base.a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function createCoverTexture(index: number) {
  const [title, category, tone] = titles[index % titles.length];
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 720;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Texture();
  context.fillStyle = tone;
  context.fillRect(0, 0, 512, 720);
  const gradient = context.createLinearGradient(0, 0, 512, 720);
  gradient.addColorStop(0, "rgba(255,235,190,.18)");
  gradient.addColorStop(1, "rgba(10,8,6,.42)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 720);
  context.strokeStyle = "rgba(239,211,158,.62)";
  context.lineWidth = 3;
  context.strokeRect(28, 28, 456, 664);
  context.lineWidth = 1;
  context.strokeRect(42, 42, 428, 636);
  context.beginPath();
  context.arc(256, 300, 124, 0, Math.PI * 2);
  context.strokeStyle = "rgba(239,211,158,.42)";
  context.lineWidth = 2;
  context.stroke();
  context.fillStyle = "#f0dfbd";
  context.textAlign = "center";
  context.font = "500 19px Georgia";
  context.fillText("ALL BOOKS / OTTAWA", 256, 94);
  context.font = "bold 45px Georgia";
  const words = title.split(" ");
  const midpoint = Math.ceil(words.length / 2);
  context.fillText(words.slice(0, midpoint).join(" "), 256, 490, 420);
  if (words.slice(midpoint).length) context.fillText(words.slice(midpoint).join(" "), 256, 545, 420);
  context.font = "18px monospace";
  context.fillStyle = "rgba(240,223,189,.8)";
  context.fillText(category, 256, 628);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeBook(index: number): BookRig {
  const group = new THREE.Group();
  group.userData.bookIndex = index;
  const pageMaterial = new THREE.MeshStandardMaterial({ color: "#d6c8a8", roughness: 0.95 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: "#39271f", roughness: 0.78 });
  const pages = new THREE.Mesh(new THREE.BoxGeometry(0.86, 1.24, 0.13), pageMaterial);
  pages.position.z = -0.005;
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.31, 0.18), darkMaterial);
  spine.position.x = -0.47;
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.93, 1.33, 0.035), darkMaterial);
  back.position.z = -0.09;
  group.add(pages, spine, back);

  const texture = createCoverTexture(index);
  const coverMaterial = new THREE.ShaderMaterial({
    uniforms: { uCover: { value: texture }, uHover: { value: 0 }, uTime: { value: 0 } },
    vertexShader,
    fragmentShader,
  });
  const coverPivot = new THREE.Group();
  coverPivot.position.x = -0.46;
  const cover = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.33, 0.035), [
    darkMaterial, darkMaterial, darkMaterial, darkMaterial, coverMaterial, darkMaterial,
  ]);
  cover.position.set(0.46, 0, 0.09);
  coverPivot.add(cover);
  group.add(coverPivot);
  return { group, coverPivot, coverMaterial, index, opened: false };
}

export default function ImmersiveBookScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<number | null>(null);
  const resetSceneRef = useRef<(index: number) => void>(() => {});
  const [selected, setSelected] = useState<number | null>(null);
  const [cursorActive, setCursorActive] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#11100e", 0.045);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 9.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.className = "book-webgl-canvas";
    renderer.domElement.setAttribute("aria-label", "Interactive floating three-dimensional book collection");
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight("#ead9bd", 1.45));
    const keyLight = new THREE.PointLight("#f4c58a", 58, 24);
    keyLight.position.set(3.5, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight("#a6b5a0", 28, 20);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    const cloud = new THREE.Group();
    scene.add(cloud);
    const rigs: BookRig[] = [];
    const spread = 14;
    const originalPositions: THREE.Vector3[] = [];
    const isMobileLayout = window.matchMedia("(max-width: 760px)").matches;
    // Restore the elliptical orbit that frames the headline.
    const orbitCenterX = 0;
    const orbitRadiusX = isMobileLayout ? 1.45 : 3.55;
    const orbitRadiusY = isMobileLayout ? 1.05 : 2.42;
    for (let index = 0; index < spread; index += 1) {
      const rig = makeBook(index);
      const angle = (index / spread) * Math.PI * 2;
      const position = new THREE.Vector3(
        orbitCenterX + Math.cos(angle) * orbitRadiusX,
        Math.sin(angle) * orbitRadiusY,
        Math.sin(angle * 2) * 0.42 + (index % 3) * 0.08,
      );
      originalPositions.push(position.clone());
      rig.group.position.copy(position);
      rig.group.rotation.set(
        Math.sin(angle) * 0.045,
        Math.cos(angle) * 0.1,
        Math.sin(angle * 2) * 0.045,
      );
      rig.group.scale.setScalar(isMobileLayout ? 0.39 + (index % 2) * 0.025 : 0.58 + (index % 3) * 0.025);
      cloud.add(rig.group);
      rigs.push(rig);
    }

    const cursor = document.querySelector<HTMLElement>(".magnetic-cursor");
    const cursorLeft = cursor ? gsap.quickTo(cursor, "left", { duration: 0.12, ease: "power3.out" }) : null;
    const cursorTop = cursor ? gsap.quickTo(cursor, "top", { duration: 0.12, ease: "power3.out" }) : null;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(2, 2);
    const targetRotation = new THREE.Vector2();
    const currentRotation = new THREE.Vector2();
    const clock = new THREE.Clock();
    let hovered: BookRig | null = null;
    let animationFrame = 0;
    let disposed = false;
    let pointerOnCanvas = false;

    const resize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      const mobile = window.matchMedia("(max-width: 760px)").matches;
      camera.aspect = width / Math.max(height, 1);
      camera.position.z = mobile ? 8.8 : 9.2;
      camera.updateProjectionMatrix();
      cloud.position.set(0, 0, 0);
      cloud.scale.setScalar(mobile ? 0.78 : width < 1100 ? 0.88 : 0.96);
      renderer.setSize(width, height, false);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const updatePointer = (event: PointerEvent) => {
      cursorLeft?.(event.clientX);
      cursorTop?.(event.clientY);
      if (cursor) cursor.style.opacity = "1";
      pointerOnCanvas = event.target === renderer.domElement;
      if (pointerOnCanvas) {
        const bounds = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
        targetRotation.set(pointer.y * 0.045, pointer.x * 0.07);
      } else {
        pointer.set(2, 2);
        targetRotation.set(0, 0);
      }
    };
    const hideCursor = () => {
      if (cursor) cursor.style.opacity = "0";
      pointerOnCanvas = false;
      pointer.set(2, 2);
      targetRotation.set(0, 0);
    };
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerleave", hideCursor);

    const findBook = (object: THREE.Object3D | null): BookRig | null => {
      let current = object;
      while (current && current !== cloud) {
        const index = current.userData.bookIndex;
        if (typeof index === "number") return rigs[index] ?? null;
        current = current.parent;
      }
      return null;
    };

    const handleClick = () => {
      if (!hovered || selectedRef.current !== null) return;
      const rig = hovered;
      selectedRef.current = rig.index;
      setSelected(rig.index);
      gsap.to(rig.group.position, { x: 0, y: 0, z: 2.6, duration: 0.9, ease: "power4.inOut" });
      gsap.to(rig.group.rotation, { x: 0, y: 0, z: 0, duration: 0.9, ease: "power4.inOut" });
      gsap.to(rig.group.scale, { x: 1.45, y: 1.45, z: 1.45, duration: 0.9, ease: "power4.inOut" });
      gsap.delayedCall(0.62, () => {
        rig.opened = true;
        gsap.to(rig.coverPivot.rotation, { y: -Math.PI / 2, duration: 0.75, ease: "power3.inOut" });
      });
    };
    renderer.domElement.addEventListener("click", handleClick);

    const kineticA = gsap.to(".webgl-kinetic-word.word-a", {
      xPercent: 12, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
    });
    const kineticB = gsap.to(".webgl-kinetic-word.word-b", {
      xPercent: -12, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
    });
    const positionTweens = rigs.map((rig, index) => {
      const angle = index * 0.9;
      return gsap.to(rig.group.position, {
        x: Math.cos(angle) * 0.75,
        y: (index - (spread - 1) / 2) * 0.19,
        z: Math.sin(angle) * 0.5,
        ease: "none",
        scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "top top", scrub: 1 },
      });
    });
    const rotationTweens = rigs.map((rig, index) => gsap.to(rig.group.rotation, {
      y: Math.cos(index) * 0.2,
      z: Math.sin(index * 0.9) * 0.08,
      ease: "none",
      scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "top top", scrub: 1 },
    }));

    const tick = () => {
      if (disposed) return;
      const elapsed = clock.getElapsedTime();
      currentRotation.lerp(targetRotation, 0.035);
      cloud.rotation.x = currentRotation.x + Math.sin(elapsed * 0.18) * 0.018;
      cloud.rotation.y = currentRotation.y;
      rigs.forEach((rig, index) => {
        if (selectedRef.current !== null) return;
        const angle = (index / spread) * Math.PI * 2 + elapsed * 0.16;
        const mobile = window.matchMedia("(max-width: 760px)").matches;
        const radiusX = mobile ? 1.45 : 3.55;
        const radiusY = mobile ? 1.05 : 2.42;
        rig.group.position.x = Math.cos(angle) * radiusX;
        rig.group.position.y = Math.sin(angle) * radiusY + Math.sin(elapsed * 0.7 + index) * 0.08;
        rig.group.position.z = Math.sin(angle * 2) * 0.38;
        rig.group.rotation.z = Math.sin(angle * 2) * 0.045;
      });
      raycaster.setFromCamera(pointer, camera);
      const intersections = pointerOnCanvas ? raycaster.intersectObjects(rigs.map((rig) => rig.group), true) : [];
      const next = intersections.length ? findBook(intersections[0].object) : null;
      if (next !== hovered) {
        if (hovered) gsap.to(hovered.coverMaterial.uniforms.uHover, { value: 0, duration: 0.25 });
        hovered = next;
        if (hovered) gsap.to(hovered.coverMaterial.uniforms.uHover, { value: 1, duration: 0.3 });
        setCursorActive(Boolean(hovered));
      }
      rigs.forEach((rig, index) => {
        rig.coverMaterial.uniforms.uTime.value = elapsed + index * 0.17;
        if (!rig.opened && selectedRef.current === null) {
          rig.group.position.y += Math.sin(elapsed * 0.55 + index) * 0.00035;
        }
      });
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(tick);
    };
    tick();

    resetSceneRef.current = (index: number) => {
      const active = rigs[index];
      if (!active) return;
      active.opened = false;
      const position = originalPositions[index];
      gsap.to(active.group.position, { x: position.x, y: position.y, z: position.z, duration: 0.75, ease: "power3.inOut" });
      gsap.to(active.group.rotation, {
        x: Math.sin(index * 1.7) * 0.09,
        y: Math.cos(index * 2.1) * 0.16,
        z: Math.sin(index * 2.8) * 0.13,
        duration: 0.75,
        ease: "power3.inOut",
      });
      const scale = window.matchMedia("(max-width: 760px)").matches ? 0.39 + (index % 2) * 0.025 : 0.58 + (index % 3) * 0.025;
      gsap.to(active.group.scale, { x: scale, y: scale, z: scale, duration: 0.75, ease: "power3.inOut" });
      gsap.to(active.coverPivot.rotation, { y: 0, duration: 0.6, ease: "power3.inOut" });
    };

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerleave", hideCursor);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("click", handleClick);
      [kineticA, kineticB, ...positionTweens, ...rotationTweens].forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
      if (cursor) cursor.style.opacity = "";
      rigs.forEach((rig) => {
        rig.group.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => material.dispose());
          }
        });
        rig.coverMaterial.uniforms.uCover.value.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const closeDetails = () => {
    const activeIndex = selectedRef.current;
    if (activeIndex !== null) resetSceneRef.current(activeIndex);
    selectedRef.current = null;
    setSelected(null);
  };

  return (
    <>
      <div className="webgl-book-stage" ref={mountRef} aria-hidden={selected !== null}>
        <div className="webgl-kinetic-word word-a" aria-hidden="true">EXPLORE</div>
        <div className="webgl-kinetic-word word-b" aria-hidden="true">IMAGINE</div>
        <div className="webgl-caption">A LIVING ARCHIVE <span>·</span> MOVE TO EXPLORE</div>
        <div className="webgl-crosshair" aria-hidden="true">+</div>
      </div>
      <div className={`magnetic-cursor${cursorActive ? " is-active" : ""}`} aria-hidden="true">
        <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" /><path d="M32 18v28M18 32h28" /></svg>
      </div>
      {selected !== null && (
        <div className="book-detail-curtain" role="dialog" aria-modal="true" aria-labelledby="book-detail-title">
          <button className="book-detail-close" onClick={closeDetails} aria-label="Close book details"><X size={20} /></button>
          <span className="eyebrow">ALL BOOKS / ARCHIVE OBJECT {String(selected + 1).padStart(3, "0")}</span>
          <h2 id="book-detail-title">{titles[selected][0]}</h2>
          <p>{titles[selected][1]} · AN IMAGINED COVER STUDY</p>
          <p className="book-detail-copy">A visual invitation into the shelves at All Books. This is illustrative artwork, not a live inventory listing. Visit the shop to discover the real books waiting to be found.</p>
          <a href="#coordinates" onClick={closeDetails}>VISIT THE SHOP <ArrowUpRight size={16} /></a>
        </div>
      )}
    </>
  );
}
