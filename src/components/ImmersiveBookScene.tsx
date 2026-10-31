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
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uCover;
  uniform float uHover;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vec4 base = texture2D(uCover, vUv);
    float sweep = fract(uTime * 0.24);
    float band = 1.0 - smoothstep(0.0, 0.22, abs(vUv.x - sweep));
    float shimmer = band * uHover;
    vec3 rainbow = 0.5 + 0.5 * cos(6.2831 * (vUv.xyx + vec3(0.0, 0.33, 0.67) + uTime * 0.08));
    float edge = smoothstep(0.0, 0.12, vUv.x) * (1.0 - smoothstep(0.88, 1.0, vUv.x));
    vec3 color = mix(base.rgb, rainbow, shimmer * 0.42 * edge);
    color += vec3(0.9, 0.7, 0.45) * shimmer * 0.12;
    gl_FragColor = vec4(color, base.a);
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
  context.beginPath();
  context.arc(256, 300, 94, 0, Math.PI * 2);
  context.strokeStyle = "rgba(239,211,158,.22)";
  context.stroke();
  context.fillStyle = "#f0dfbd";
  context.textAlign = "center";
  context.font = "500 19px Georgia";
  context.fillText("ALL BOOKS  /  OTTAWA", 256, 94);
  context.font = "bold 48px Georgia";
  const words = title.split(" ");
  const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ");
  const line2 = words.slice(Math.ceil(words.length / 2)).join(" ");
  context.fillText(line1, 256, 490, 420);
  if (line2) context.fillText(line2, 256, 545, 420);
  context.font = "18px monospace";
  context.fillStyle = "rgba(240,223,189,.8)";
  context.fillText(category, 256, 628);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeBook(index: number): BookRig {
  const group = new THREE.Group();
  const pageMaterial = new THREE.MeshStandardMaterial({ color: "#d6c8a8", roughness: 0.95 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: "#39271f", roughness: 0.78 });
  const pages = new THREE.Mesh(new THREE.BoxGeometry(0.86, 1.24, 0.13), pageMaterial);
  pages.position.z = -0.005;
  group.add(pages);

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.31, 0.18), darkMaterial);
  spine.position.x = -0.47;
  group.add(spine);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.93, 1.33, 0.035), darkMaterial);
  back.position.z = -0.09;
  group.add(back);

  const texture = createCoverTexture(index);
  const coverMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uCover: { value: texture },
      uHover: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader,
    fragmentShader,
  });
  const coverPivot = new THREE.Group();
  coverPivot.position.x = -0.46;
  const cover = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.33, 0.035), [
    darkMaterial, darkMaterial, darkMaterial, darkMaterial, coverMaterial, darkMaterial,
  ]);
  cover.position.x = 0.46;
  cover.position.z = 0.09;
  cover.userData.bookIndex = index;
  coverPivot.add(cover);
  group.add(coverPivot);

  return { group, coverPivot, coverMaterial, index, opened: false };
}

export default function ImmersiveBookScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [cursorActive, setCursorActive] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#11100e", 0.035);
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 9.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.className = "book-webgl-canvas";
    renderer.domElement.setAttribute("aria-label", "Interactive floating three-dimensional book collection");
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight("#ead9bd", 1.65));
    const keyLight = new THREE.PointLight("#f4c58a", 70, 24);
    keyLight.position.set(3.5, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight("#a6b5a0", 35, 20);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    const rigs: BookRig[] = [];
    const spread = 14;
    for (let index = 0; index < spread; index += 1) {
      const rig = makeBook(index);
      const angle = index * 2.399;
      rig.group.position.set(
        Math.cos(angle) * (1.7 + (index % 3) * 0.48),
        Math.sin(angle) * (1.4 + (index % 4) * 0.3),
        (index % 5 - 2) * 0.42,
      );
      rig.group.rotation.set((Math.random() - 0.5) * 0.65, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.45);
      rig.group.scale.setScalar(0.78 + (index % 3) * 0.08);
      rig.group.userData.bookIndex = index;
      scene.add(rig.group);
      rigs.push(rig);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(2, 2);
    const targetRotation = new THREE.Vector2();
    const currentRotation = new THREE.Vector2();
    const clock = new THREE.Clock();
    let hovered: BookRig | null = null;
    let animationFrame = 0;
    let disposed = false;

    const resize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      targetRotation.set(pointer.y * 0.12, pointer.x * 0.18);
    };
    const handlePointerLeave = () => {
      pointer.set(2, 2);
      targetRotation.set(0, 0);
      setCursorActive(false);
    };
    const handleClick = () => {
      if (!hovered || selected !== null) return;
      const rig = hovered;
      setSelected(rig.index);
      const viewTransition = (document as Document & { startViewTransition?: (callback: () => void) => { ready: Promise<void> } }).startViewTransition;
      if (viewTransition) viewTransition(() => undefined);
      gsap.to(rig.group.position, { x: 0, y: 0, z: 3.1, duration: 1.1, ease: "power4.inOut" });
      gsap.to(rig.group.rotation, { x: 0, y: 0, z: 0, duration: 1.1, ease: "power4.inOut" });
      gsap.to(rig.group.scale, { x: 1.75, y: 1.75, z: 1.75, duration: 1.1, ease: "power4.inOut" });
      gsap.delayedCall(0.75, () => {
        rig.opened = true;
        gsap.to(rig.coverPivot.rotation, { y: -1.42, duration: 0.85, ease: "power3.inOut" });
      });
    };

    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    renderer.domElement.addEventListener("click", handleClick);

    const scrollTweens = rigs.map((rig, index) => {
      const angle = index * 0.9;
      const target = {
        x: Math.cos(angle) * 0.9,
        y: (index - (spread - 1) / 2) * 0.34,
        z: Math.sin(angle) * 0.9,
        rotationY: angle,
        rotationZ: Math.sin(angle) * 0.08,
      };
      return gsap.to(rig.group.position, {
        x: target.x, y: target.y, z: target.z,
        ease: "none",
        scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "top top", scrub: 1 },
      });
    });
    const rotationTweens = rigs.map((rig, index) => gsap.to(rig.group.rotation, {
      y: index * 0.9,
      z: Math.sin(index * 0.9) * 0.08,
      ease: "none",
      scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "top top", scrub: 1 },
    }));

    const tick = () => {
      if (disposed) return;
      const elapsed = clock.getElapsedTime();
      currentRotation.lerp(targetRotation, 0.035);
      scene.rotation.x = currentRotation.x;
      scene.rotation.y = currentRotation.y;
      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObjects(rigs.map((rig) => rig.group), true);
      const next = intersections.length
        ? rigs.find((rig) => rig.index === intersections[0].object.userData.bookIndex || rig.group === intersections[0].object.parent)
        : null;
      if (next !== hovered) {
        if (hovered) gsap.to(hovered.coverMaterial.uniforms.uHover, { value: 0, duration: 0.35 });
        hovered = next ?? null;
        if (hovered) gsap.to(hovered.coverMaterial.uniforms.uHover, { value: 1, duration: 0.45 });
        setCursorActive(Boolean(hovered));
      }
      rigs.forEach((rig, index) => {
        rig.coverMaterial.uniforms.uTime.value = elapsed + index * 0.17;
        if (!rig.opened && selected === null) {
          rig.group.position.y += Math.sin(elapsed * 0.65 + index) * 0.0008;
          rig.group.rotation.z += Math.sin(elapsed * 0.4 + index) * 0.00012;
        }
      });
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(tick);
    };
    tick();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      renderer.domElement.removeEventListener("click", handleClick);
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === ".manifesto") trigger.kill();
      });
      scrollTweens.forEach((tween) => tween.kill());
      rotationTweens.forEach((tween) => tween.kill());
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
  }, [selected]);

  const closeDetails = () => {
    setSelected(null);
    const viewTransition = (document as Document & { startViewTransition?: (callback: () => void) => { ready: Promise<void> } }).startViewTransition;
    if (viewTransition) viewTransition(() => undefined);
  };

  return (
    <>
      <div className="webgl-book-stage" ref={mountRef} aria-hidden={selected !== null}>
        <div className="webgl-caption">A LIVING ARCHIVE <span>·</span> MOVE TO EXPLORE</div>
        <div className="webgl-crosshair" aria-hidden="true">+</div>
      </div>
      <div className={`magnetic-cursor${cursorActive ? " is-active" : ""}`} aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" /><path d="M32 18v28M18 32h28" /></svg></div>
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
