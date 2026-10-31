"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
  AudioLines,
  Crosshair,
  MapPin,
  Menu,
  MoveUpRight,
  Orbit,
  Phone,
  Sparkles,
  X,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const shelves = [
  { index: "01", name: "Science fiction", detail: "Future histories. Strange worlds. Old visions of tomorrow.", tag: "SIGNAL FOUND", color: "violet", glyph: "SF" },
  { index: "02", name: "French literature", detail: "A deep shelf of voices, from the familiar to the hard to find.", tag: "LANGUAGE / FR", color: "mint", glyph: "FR" },
  { index: "03", name: "Fiction & beyond", detail: "Novels, essays, history, philosophy, art and everything between.", tag: "WIDE FREQUENCY", color: "amber", glyph: "XX" },
  { index: "04", name: "Rare & out of print", detail: "The books that stopped being printed. Not the books that stopped mattering.", tag: "LOW QUANTITY", color: "paper", glyph: "R/" },
];

function SplitText({ children }: { children: string }) {
  return <span aria-label={children} className="split-line">{Array.from(children).map((char, index) => <span aria-hidden="true" className="split-char" key={index}>{char === " " ? "\u00a0" : char}</span>)}</span>;
}

function BookArtifact({ code, title, subtitle, tone, note }: { code: string; title: string; subtitle: string; tone: string; note: string }) {
  return (
    <div className={`book-card book-${tone}`} data-tilt>
      <div className="book-card-glow" />
      <div className="book-face">
        <div className="book-topline"><span>ALL BOOKS / ARCHIVE</span><span>{code}</span></div>
        <div className="book-art-orbit" aria-hidden="true"><span /><span /><span /></div>
        <div className="book-face-copy"><span className="book-kicker">{subtitle}</span><span className="book-title">{title}</span></div>
        <div className="book-bottomline"><span>{note}</span><span>OTTAWA · CAN</span></div>
      </div>
      <div className="book-spine" aria-hidden="true" />
    </div>
  );
}

export default function ArchiveExperience() {
  const root = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(".reveal, .hero-title .split-char, .nav-mark", { clearProps: "all" });
      return;
    }

    const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
    intro
      .from(".nav-mark", { y: 18, opacity: 0, duration: 0.8 })
      .from(".hero-meta > *", { y: 16, opacity: 0, stagger: 0.1, duration: 0.65 }, "-=0.45")
      .from(".hero-title .split-char", { yPercent: 115, rotateX: -70, opacity: 0, stagger: 0.025, duration: 1.05, transformOrigin: "50% 100%" }, "-=0.4")
      .from(".hero-description, .hero-actions, .hero-index", { y: 22, opacity: 0, stagger: 0.12, duration: 0.75 }, "-=0.5")
      .from(".hero-artifact", { scale: 0.82, rotate: 7, opacity: 0, duration: 1.2 }, "-=0.8")
      .from(".hero-orbit-label", { opacity: 0, x: 14, stagger: 0.12, duration: 0.5 }, "-=0.7");

    gsap.utils.toArray<HTMLElement>(".float-orbit").forEach((item, index) => {
      gsap.to(item, { y: index % 2 === 0 ? -18 : 15, rotate: index % 2 === 0 ? 3 : -3, duration: 3.4 + index * 0.55, ease: "sine.inOut", repeat: -1, yoyo: true });
    });

    gsap.utils.toArray<HTMLElement>(".parallax-layer").forEach((layer) => {
      gsap.to(layer, { yPercent: Number(layer.dataset.speed ?? -12), ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.8 } });
    });

    gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) => {
      gsap.fromTo(element, { y: 42, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 88%", once: true } });
    });

    gsap.utils.toArray<HTMLElement>(".shelf-row").forEach((row, index) => {
      gsap.from(row, { x: index % 2 === 0 ? -35 : 35, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: row, start: "top 88%", once: true } });
    });

    const tiltCleanups: Array<() => void> = [];
    gsap.utils.toArray<HTMLElement>("[data-tilt]").forEach((card) => {
      const rotateX = gsap.quickTo(card, "rotationX", { duration: 0.45, ease: "power3.out" });
      const rotateY = gsap.quickTo(card, "rotationY", { duration: 0.45, ease: "power3.out" });
      const move = (event: PointerEvent) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        rotateX(y * -13);
        rotateY(x * 16);
      };
      const reset = () => { rotateX(0); rotateY(0); };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", reset);
      tiltCleanups.push(() => { card.removeEventListener("pointermove", move); card.removeEventListener("pointerleave", reset); });
    });

    return () => tiltCleanups.forEach((cleanup) => cleanup());
  }, { scope: root });

  const toggleMenu = () => {
    menuRef.current?.classList.toggle("menu-open");
    document.body.classList.toggle("menu-is-open");
  };
  const closeMenu = () => {
    menuRef.current?.classList.remove("menu-open");
    document.body.classList.remove("menu-is-open");
  };

  return (
    <main ref={root} className="site-shell">
      <div className="grain" aria-hidden="true" /><div className="scanlines" aria-hidden="true" />
      <header className="site-header">
        <a href="#top" className="nav-mark" aria-label="All Books home"><span className="mark-symbol">A<span>/</span>B</span><span className="mark-word">ALL BOOKS<small>SECOND-HAND BOOKS · OTTAWA</small></span></a>
        <nav className="desktop-nav" aria-label="Main navigation"><a href="#archive">THE ARCHIVE</a><a href="#signal">OUR STORY</a><a href="#coordinates">FIND US</a></nav>
        <a className="header-visit" href="#coordinates"><span className="status-dot" /> VISIT THE STORE <ArrowUpRight size={14} /></a>
        <button className="menu-toggle" aria-label="Toggle navigation" onClick={toggleMenu}><Menu size={22} /></button>
      </header>
      <div className="mobile-menu" ref={menuRef}><button className="mobile-menu-close" aria-label="Close menu" onClick={closeMenu}><X /></button><a href="#archive" onClick={closeMenu}>THE ARCHIVE <ArrowUpRight /></a><a href="#signal" onClick={closeMenu}>OUR STORY <ArrowUpRight /></a><a href="#coordinates" onClick={closeMenu}>FIND US <ArrowUpRight /></a></div>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" /><div className="hero-halo halo-one parallax-layer" data-speed="-14" /><div className="hero-halo halo-two parallax-layer" data-speed="10" />
        <div className="hero-vertical-code" aria-hidden="true">RIDEAU STREET / LOWER TOWN / OTTAWA</div>
        <div className="hero-content">
          <div className="hero-meta"><span><span className="status-dot" /> INDEPENDENT BOOKSHOP / OTTAWA</span><span className="meta-right">FIELD NOTES — 001 / 026</span></div>
          <h1 className="hero-title"><span className="title-line"><SplitText>ALL BOOKS.</SplitText></span><span className="title-line title-outline"><SplitText>ALL OVER.</SplitText></span><span className="title-line title-offset"><SplitText>ALL THE TIME.</SplitText></span></h1>
          <div className="hero-bottom">
            <div className="hero-description"><span className="eyebrow">A BOOKSHOP ON RIDEAU STREET</span><p>A little bit of everything, stacked floor to ceiling. Come in looking for one book and leave with three you never expected to find.</p><div className="hero-actions"><a className="button-primary" href="#archive">EXPLORE THE SHELVES <ArrowDownRight size={16} /></a><a className="text-link" href="#coordinates">GET DIRECTIONS <ArrowUpRight size={15} /></a></div></div>
            <div className="hero-index"><span className="index-label">CURRENT LOCATION</span><strong>327 <span>RIDEAU ST.</span></strong><span className="index-sub">OTTAWA, ON · K1N 5Y4</span></div>
          </div>
        </div>
        <div className="hero-visual parallax-layer" data-speed="-7" aria-hidden="true">
          <div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="orbit orbit-c" />
          <div className="hero-artifact float-orbit"><div className="artifact-cover"><div className="artifact-cover-top"><span>AB / 327</span><span>VOL. 001</span></div><div className="artifact-rings"><i /><i /><i /></div><div className="artifact-word">THE<br />HUMAN<br /><em>INDEX</em></div><div className="artifact-cover-bottom"><span>AN INFINITE COLLECTION</span><span>OTTAWA / CANADA</span></div></div><div className="artifact-side" /></div>
          <div className="hero-orbit-label label-top"><span className="label-cross">+</span> UNCATALOGUED / UNEXPECTED</div><div className="hero-orbit-label label-bottom"><span className="label-pulse" /> SIGNAL: CURIOSITY</div><div className="hero-coordinate">RIDEAU ST.<br />OTTAWA, CANADA</div>
        </div>
        <div className="hero-footerline"><span>NOT A CHAIN. NOT AN ALGORITHM. JUST BOOKS.</span><span className="scroll-cue">SCROLL TO EXPLORE <ArrowDown size={13} /></span><span>FIG. 001 — THE STACKS</span></div>
      </section>

      <section className="manifesto section-pad" id="signal">
        <div className="section-kicker reveal"><span>01 / THE FREQUENCY</span><span>ABOUT THIS PLACE</span></div>
        <div className="manifesto-grid"><h2 className="manifesto-title reveal">THE INTERNET HAS EVERYTHING.<br /><em>WE HAVE THE BOOK.</em></h2><div className="manifesto-copy reveal"><span className="signal-icon"><AudioLines size={19} /></span><p>There is a particular kind of magic in a bookshop that refuses to fit everything neatly into a grid. All Books is a second-hand bookshop on Rideau Street, packed with stories, oddities and unexpected discoveries.</p><p>No recommendation engine. No endless scroll. Just shelves worth getting lost in — and a person who knows the terrain.</p><a href="#coordinates" className="text-link">FIND YOUR WAY HERE <ArrowUpRight size={15} /></a></div></div>
        <div className="manifesto-stats reveal"><div><strong>327</strong><span>RIDEAU STREET</span></div><div><strong>∞</strong><span>WAYS TO GET LOST</span></div><div><strong>01</strong><span>VERY REAL BOOKSHOP</span></div><div className="stat-note">A SMALL SPACE<br />WITH A BIG MEMORY.</div></div>
      </section>

      <section className="archive section-pad" id="archive">
        <div className="section-kicker reveal"><span>02 / THE LIVING ARCHIVE</span><span>OPEN FILES — 04</span></div>
        <div className="archive-heading reveal"><div><span className="eyebrow">SOMEWHERE IN THESE STACKS</span><h2>FOLLOW A<br /><em>THREAD.</em></h2></div><p>These are a few of the worlds All Books is known for. The shelves move, the discoveries change. That's the point.</p></div>
        <div className="shelf-list">{shelves.map((shelf) => <a className={`shelf-row shelf-${shelf.color}`} href="#coordinates" key={shelf.index}><span className="shelf-index">{shelf.index}</span><span className="shelf-glyph">{shelf.glyph}</span><span className="shelf-main"><strong>{shelf.name}</strong><small>{shelf.detail}</small></span><span className="shelf-tag">{shelf.tag}</span><span className="shelf-arrow"><ArrowUpRight size={20} /></span></a>)}</div>
        <div className="archive-footnote reveal"><span><Sparkles size={14} /> NO TWO VISITS ARE THE SAME</span><span>INVENTORY CHANGES CONSTANTLY — COME BROWSE.</span></div>
      </section>

      <section className="artifact-section">
        <div className="artifact-backdrop" aria-hidden="true" /><div className="section-kicker reveal"><span>03 / OBJECTS OF INTEREST</span><span>AN EXERCISE IN DISCOVERY</span></div>
        <div className="artifact-heading reveal"><h2>THE BEAUTY<br />OF THE <em>UNEXPECTED.</em></h2><p>Some books find you. Some you have to dig for. Either way, keep looking.</p></div>
        <div className="artifact-gallery"><div className="artifact-note note-left float-orbit"><span>ARCHIVE NOTE / A</span><strong>OLD WORLDS.<br />NEW WINDOWS.</strong><small>THE PAST IS STILL IN PRINT.</small></div><BookArtifact code="AB—001" title="OTHER WORLDS" subtitle="SCIENCE FICTION" tone="violet" note="EXPLORE THE UNKNOWN" /><BookArtifact code="AB—002" title="LOST LANGUAGES" subtitle="FRENCH LITERATURE" tone="amber" note="VOICES ACROSS TIME" /><BookArtifact code="AB—003" title="THE LONG VIEW" subtitle="HISTORY / IDEAS" tone="mint" note="THOUGHTS THAT REMAIN" /><div className="artifact-note note-right float-orbit"><span>ARCHIVE NOTE / B</span><strong>OUT OF PRINT.<br />NOT OUT OF TIME.</strong><small>THE HUNT IS THE WHOLE POINT.</small></div></div>
        <div className="artifact-disclaimer">ILLUSTRATIVE ARCHIVE ARTWORK · NOT A LIVE INVENTORY FEED</div>
      </section>

      <section className="visit section-pad" id="coordinates">
        <div className="section-kicker reveal"><span>04 / THE REAL WORLD</span><span>COORDINATES LOCKED</span></div>
        <div className="visit-grid">
          <div className="visit-copy reveal"><span className="eyebrow"><span className="status-dot" /> YOU ARE CLEARED TO BROWSE</span><h2>COME FIND<br /><em>YOUR NEXT</em><br />OBSESSION.</h2><p>We're on Rideau Street, right beside the ByTowne Cinema. Look for the books. There will be a lot of them.</p><div className="visit-address"><MapPin size={18} /><div><strong>ALL BOOKS</strong><span>327 Rideau Street<br />Ottawa, Ontario K1N 5Y4</span></div></div><div className="visit-actions"><a className="button-primary" href="https://www.google.com/maps/search/?api=1&query=All+Books+327+Rideau+Street+Ottawa" target="_blank" rel="noreferrer">OPEN NAVIGATION <ArrowUpRight size={16} /></a><a className="phone-link" href="tel:+16137899544"><Phone size={15} /> (613) 789-9544</a><a className="phone-link" href="https://www.abebooks.com/all-books-ottawa-ottawa-on-canada/52468515/sf" target="_blank" rel="noreferrer">ABEBOOKS LISTING <ArrowUpRight size={13} /></a></div><div className="hours-note"><span className="hours-dot" /> HOURS CHANGE — CALL AHEAD BEFORE MAKING THE TRIP.</div></div>
          <div className="map-terminal reveal"><div className="terminal-top"><span><Crosshair size={14} /> LOCAL POSITIONING SYSTEM</span><span>MAP / 001</span></div><div className="wire-map" role="img" aria-label="Schematic map showing All Books at 327 Rideau Street near the Rideau Street and King Edward Avenue intersection, beside ByTowne Cinema."><div className="map-grid" /><div className="street street-horizontal"><span>RIDEAU STREET</span></div><div className="street street-vertical"><span>KING EDWARD AVE.</span></div><div className="map-block block-a" /><div className="map-block block-b" /><div className="map-block block-c" /><div className="map-block block-d" /><div className="map-block block-e" /><div className="map-node node-cinema"><span>BYTOWNE<br />CINEMA</span></div><div className="map-target"><span className="target-ring ring-outer" /><span className="target-ring ring-inner" /><span className="target-core"><Crosshair size={17} /></span><span className="target-label">ALL BOOKS <small>327 RIDEAU ST.</small></span></div><div className="map-north">N <ArrowUpRight size={12} /></div><div className="map-scale">SCHEMATIC / NOT TO SCALE</div></div><div className="terminal-bottom"><span><span className="status-dot" /> DESTINATION CONFIRMED</span><span>LOWER TOWN · OTTAWA, CA</span></div></div>
        </div>
      </section>

      <section className="last-call"><div className="last-call-mark">A<span>/</span>B</div><div className="last-call-copy"><span className="eyebrow">END OF TRANSMISSION</span><h2>GO GET<br /><em>LOST.</em></h2></div><a href="https://www.google.com/maps/search/?api=1&query=All+Books+327+Rideau+Street+Ottawa" target="_blank" rel="noreferrer" className="last-call-link">327 RIDEAU STREET <ArrowUpRight size={18} /></a><div className="last-call-orbit" aria-hidden="true"><Orbit /></div></section>
      <footer className="site-footer"><a href="#top" className="footer-brand">ALL BOOKS<span>®</span></a><span>INDEPENDENTLY MINDED. DEEPLY STACKED.</span><div className="footer-links"><a href="tel:+16137899544">CALL THE SHOP</a><a href="#coordinates">FIND US <MoveUpRight size={12} /></a></div><span className="footer-copy">© {new Date().getFullYear()} ALL BOOKS · RIDEAU STREET, OTTAWA</span></footer>
    </main>
  );
}
