"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Bookmark, BookOpen,
  Check, Compass, Feather, MapPin, Menu, Minus, Phone, Sparkles, X
} from "lucide-react";

type ShelfBook = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  colour: string;
  description: string;
  mood: string;
};

const books: ShelfBook[] = [
  { id: "01", title: "The Quiet Atlas", subtitle: "LITERARY FICTION", category: "Fiction", colour: "wine", description: "For the reader who likes a slow-burning story, complicated people and places that linger long after the last page.", mood: "A quiet, thoughtful journey" },
  { id: "02", title: "A Cabinet of Wonders", subtitle: "ESSAYS & IDEAS", category: "Philosophy", colour: "olive", description: "A prompt to follow an unexpected question, turn an idea around and see the familiar world differently.", mood: "Curious and contemplative" },
  { id: "03", title: "The Far Shore", subtitle: "HISTORY", category: "History", colour: "blue", description: "For the history-minded browser drawn to distant places, forgotten details and the long shape of human events.", mood: "Expansive and reflective" },
  { id: "04", title: "Midnight Index", subtitle: "MYSTERY", category: "Crime", colour: "charcoal", description: "A darker shelf for readers who enjoy secrets, atmosphere, crooked paths and one more chapter before bed.", mood: "Shadowy and suspenseful" },
  { id: "05", title: "The Green Hour", subtitle: "NATURE & SCIENCE", category: "Science", colour: "forest", description: "A doorway into the natural world, scientific curiosity and the beautiful strangeness of ordinary things.", mood: "Wonder-filled discovery" },
  { id: "06", title: "Letters from Elsewhere", subtitle: "WORLD LITERATURE", category: "World literature", colour: "ochre", description: "For readers ready to cross borders through language, translation, memory and unfamiliar perspectives.", mood: "Warm and worldly" },
  { id: "07", title: "The Unwritten Map", subtitle: "CLASSICS", category: "Classics", colour: "plum", description: "A little literary wandering: enduring stories, old questions and sentences worth carrying around.", mood: "Timeless and immersive" },
];

const moods = [
  { label: "Cozy", opposite: "Unsettling", left: "Warm & familiar", right: "Dark & uncanny" },
  { label: "Fast-paced", opposite: "Philosophical", left: "Turn the pages", right: "Take your time" },
  { label: "Realist", opposite: "Magical", left: "Close to life", right: "Beyond the ordinary" },
];

const moodResults = [
  { name: "The fireside shelf", detail: "Comforting fiction, familiar voices and stories to settle into.", tags: ["Fiction", "Classics"] },
  { name: "The midnight shelf", detail: "Mystery, crime and darker corners for a little delicious suspense.", tags: ["Crime", "Fiction"] },
  { name: "The curious shelf", detail: "Philosophy, science and ideas that keep unfolding after you close the book.", tags: ["Philosophy", "Science"] },
  { name: "The faraway shelf", detail: "History, translated literature and journeys through other worlds.", tags: ["History", "World literature"] },
  { name: "The old-world shelf", detail: "Classics and enduring stories with a little mystery around the edges.", tags: ["Classics", "World literature"] },
];

const mysteries = [
  { riddle: "Rain. Footsteps. A secret.", reveal: "Follow the clues", description: "Look for a mystery or crime story with a strong sense of place. Ask at the shop for a well-loved paperback with a plot that keeps moving." },
  { riddle: "Dust. Time. A kingdom.", reveal: "Travel through time", description: "Try the history shelves. Ask about a readable account of a forgotten era, a place or a person whose story deserves another look." },
  { riddle: "Letters. Distance. Longing.", reveal: "A world elsewhere", description: "Explore translated fiction and French literature. Ask for a story where the voice, place and language are part of the adventure." },
  { riddle: "Silence. Questions. Wonder.", reveal: "Think differently", description: "Browse philosophy and essays. Ask for an accessible introduction to an idea you have always meant to explore." },
];

const quotes = [
  "A ROOM WITHOUT BOOKS IS LIKE A BODY WITHOUT A SOUL.",
  "SO MANY BOOKS, SO LITTLE TIME.",
  "THE WORLD WAS HER OYSTER, BUT SHE USED THE WRONG FORK.",
  "THERE IS NO FRIEND AS LOYAL AS A BOOK.",
];

const mapUrl = "https://www.google.com/maps/search/?api=1&query=All+Books+327+Rideau+Street+Ottawa";
const abeBooksUrl = "https://www.abebooks.com/all-books-ottawa-ottawa-on-canada/52468515/sf";

function BookCover({ book, compact = false }: { book: ShelfBook; compact?: boolean }) {
  return (
    <div className={"book-cover cover-" + book.colour + (compact ? " cover-compact" : "")}>
      <div className="cover-frame">
        <span className="cover-imprint">ALL BOOKS <i>·</i> OTTAWA</span>
        <span className="cover-ornament" aria-hidden="true">✳</span>
        <span className="cover-title">{book.title}</span>
        <span className="cover-subtitle">{book.subtitle}</span>
        <span className="cover-foot">A STUDY IN DISCOVERY</span>
      </div>
    </div>
  );
}

export default function ArchiveExperience() {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<ShelfBook | null>(null);
  const [moodValues, setMoodValues] = useState([32, 58, 66]);
  const [revealed, setRevealed] = useState(false);
  const [mysteryIndex, setMysteryIndex] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("all-books-reading-nook");
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) setSaved(parsed);
      }
    } catch {
      setSaved([]);
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem("all-books-reading-nook", JSON.stringify(saved));
    } catch {
      // The reading nook remains usable for this session if storage is unavailable.
    }
  }, [saved]);

  useEffect(() => {
    if (!selected && !menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, menuOpen]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const filteredBooks = useMemo(() => {
    const [cozy, pace, magic] = moodValues;
    return books.filter((book) => {
      if (cozy > 68 && ["Crime"].includes(book.category)) return false;
      if (cozy < 28 && ["Classics"].includes(book.category)) return false;
      if (pace > 72 && ["Philosophy"].includes(book.category)) return false;
      if (pace < 25 && ["Crime"].includes(book.category)) return false;
      if (magic < 25 && ["World literature"].includes(book.category)) return false;
      if (magic > 75 && ["History", "Science"].includes(book.category)) return false;
      return true;
    });
  }, [moodValues]);

  const activeMood = useMemo(() => {
    const [cozy, pace, magic] = moodValues;
    if (cozy > 65) return moodResults[0];
    if (cozy < 30) return moodResults[1];
    if (pace > 68) return moodResults[2];
    if (magic > 68) return moodResults[4];
    return moodResults[3];
  }, [moodValues]);

  const toggleSaved = (id: string) => {
    const exists = saved.includes(id);
    setSaved((current) => exists ? current.filter((item) => item !== id) : [...current, id]);
    setNotice(exists ? "Removed from your reading nook" : "Added to your reading nook");
  };

  const nextMystery = () => {
    setRevealed(false);
    setMysteryIndex((index) => (index + 1) % mysteries.length);
  };

  const savedBooks = books.filter((book) => saved.includes(book.id));
  const motionTransition = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 180, damping: 22 };

  return (
    <main className="bookshop-shell" id="top">
      <div className="paper-grain" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="All Books home">
          <span className="brand-mark"><BookOpen size={23} strokeWidth={1.35} /></span>
          <span className="brand-name">ALL BOOKS<small>SECOND-HAND BOOKS · OTTAWA</small></span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#shelves">The shelves</a><a href="#discovery">Find a feeling</a><a href="#blind-date">Blind date</a><a href="#visit">Visit</a>
        </nav>
        <a className="nav-visit" href="#visit">Come browse <ArrowUpRight size={15} /></a>
        <button className="mobile-menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}><Menu /></button>
      </header>

      <AnimatePresence>
        {menuOpen && <motion.nav className="mobile-nav" aria-label="Mobile navigation" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
          {["shelves", "discovery", "blind-date", "visit"].map((id) => <a key={id} href={"#" + id} onClick={() => setMenuOpen(false)}>{id.replace("-", " ") } <ArrowUpRight size={16} /></a>)}
        </motion.nav>}
      </AnimatePresence>

      <section className="hero-section">
        <div className="hero-backdrop" aria-hidden="true"><span className="hero-orb orb-one" /><span className="hero-orb orb-two" /><span className="hero-line" /></div>
        <div className="hero-copy">
          <motion.div className="eyebrow hero-eyebrow" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="live-dot" /> AN INDEPENDENT BOOKSHOP ON RIDEAU STREET
          </motion.div>
          <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.08 }}>
            Stories have a<br /><em>second life.</em>
          </motion.h1>
          <motion.p className="hero-intro" initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.22 }}>
            A little old-school, a little unexpected. Find your next favourite among the well-loved books at All Books, 327 Rideau Street.
          </motion.p>
          <motion.div className="hero-actions" initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.34 }}>
            <a className="button button-gold" href="#shelves">Wander the shelves <ArrowDown size={16} /></a>
            <a className="quiet-link" href="#visit">Plan a visit <ArrowUpRight size={15} /></a>
          </motion.div>
          <div className="hero-location"><MapPin size={15} /><span>327 RIDEAU STREET</span><i /> OTTAWA, ON · K1N 5Y4</div>
        </div>

        <div className="hero-books" aria-label="Illustrative book covers. These are not current inventory.">
          <div className="shelf-light" />
          <motion.div className="hero-book hero-book-back" animate={reduceMotion ? {} : { y: [0, -9, 0], rotate: [-8, -6, -8] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
            <BookCover book={books[2]} />
          </motion.div>
          <motion.div className="hero-book hero-book-front" animate={reduceMotion ? {} : { y: [0, 10, 0], rotate: [5, 7, 5] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
            <BookCover book={books[0]} />
          </motion.div>
          <div className="hero-book-note"><Sparkles size={14} /> THERE'S ALWAYS ANOTHER STORY</div>
        </div>
        <div className="hero-bottomline"><span>AN OPEN INVITATION TO GET LOST</span><span>SCROLL TO EXPLORE ↓</span></div>
      </section>

      <div className="quote-marquee" aria-label="Literary thoughts">
        <div className="quote-track">{[...quotes, ...quotes].map((quote, index) => <span key={index}>{quote}<b>✳</b></span>)}</div>
      </div>

      <section className="intro-section section-wrap">
        <div className="section-label"><span>01 / A DIFFERENT KIND OF BOOKSHOP</span><span>THE JOY IS IN THE FIND</span></div>
        <div className="intro-grid">
          <h2>Not every good<br />book is <em>new.</em></h2>
          <div className="intro-copy"><p>All Books is an independent second-hand bookshop at the heart of Ottawa's Rideau Street. Think compact aisles, tall stacks and the pleasure of finding something you weren't looking for.</p><p>There is no searchable online catalogue. If you have a title in mind, ask the owner — or come in without a plan and let the shelves surprise you.</p><a className="text-link" href="#visit">A little more about the shop <ArrowUpRight size={15} /></a></div>
        </div>
        <div className="fact-strip"><div><strong>327</strong><span>RIDEAU STREET</span></div><div><strong>∞</strong><span>UNEXPECTED FINDS</span></div><div><strong>2nd</strong><span>CHANCES FOR STORIES</span></div><p>GOOD BOOKS DESERVE<br />ANOTHER READER.</p></div>
      </section>

      <section className="shelves-section section-wrap" id="shelves">
        <div className="section-label"><span>02 / THE LIVING SHELVES</span><span>MOVE AROUND. FOLLOW A HUNCH.</span></div>
        <div className="section-heading"><div><span className="eyebrow">PULL A BOOK FROM THE SHELF</span><h2>Every spine holds<br /><em>another world.</em></h2></div><p>Choose a cover to turn it over. These are atmospheric illustrations inspired by the kinds of shelves you might explore — not a live list of titles in stock.</p></div>
        <div className="book-shelf-rail">
          <div className="shelf-top" />
          <div className="book-spines">
            {books.map((book, index) => (
              <motion.button key={book.id} className={"spine-button spine-" + book.colour} onClick={() => setSelected(book)} aria-label={"Explore illustrative book " + book.title} whileHover={reduceMotion ? {} : { y: -18, rotateZ: index % 2 ? 2 : -2 }} whileTap={{ scale: 0.97 }} layout transition={motionTransition}>
                <span className="spine-number">{book.id}</span><span className="spine-title">{book.title}</span><span className="spine-mark">✳</span>
              </motion.button>
            ))}
          </div>
          <div className="shelf-wood"><span>ALL BOOKS · RIDEAU STREET</span><span>TAKE YOUR TIME</span></div>
        </div>
        <div className="shelf-caption"><span><Sparkles size={14} /> A LITTLE BROWSING GOES A LONG WAY</span><span>SELECT A SPINE TO OPEN THE COVER</span></div>
      </section>

      <AnimatePresence>
        {selected && <motion.div className="book-modal-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
          <motion.div className="book-modal" role="dialog" aria-modal="true" aria-labelledby="modal-book-title" initial={{ opacity: 0, y: 35, rotateX: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }} onClick={(event) => event.stopPropagation()} transition={motionTransition}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close book details"><X /></button>
            <div className="modal-cover-wrap"><BookCover book={selected} /></div>
            <div className="modal-copy"><span className="eyebrow">A SHELF-SIDE IMPRESSION · {selected.category.toUpperCase()}</span><h2 id="modal-book-title">{selected.title}</h2><p>{selected.description}</p><div className="modal-note"><Feather size={16} /> {selected.mood}</div><p className="inventory-note">Illustrative concept only — this is not a confirmed title or stock listing.</p><button className="button button-gold" onClick={() => toggleSaved(selected.id)}>{saved.includes(selected.id) ? <Check size={16} /> : <Bookmark size={16} />}{saved.includes(selected.id) ? "Saved in your nook" : "Save this discovery"}</button></div>
          </motion.div>
        </motion.div>}
      </AnimatePresence>

      <section className="discovery-section section-wrap" id="discovery">
        <div className="section-label"><span>03 / THE DISCOVERY ENGINE</span><span>LET YOUR MOOD LEAD</span></div>
        <div className="section-heading"><div><span className="eyebrow">THERE'S A SHELF FOR EVERY FEELING</span><h2>What are you<br /><em>in the mood for?</em></h2></div><p>Move the dials and let your instincts do the browsing. This playful guide suggests areas of the shop to explore, not specific books currently in stock.</p></div>
        <div className="mood-layout">
          <div className="mood-controls">
            {moods.map((mood, index) => <div className="mood-control" key={mood.label}><div className="mood-labels"><span>{mood.left}</span><span>{mood.right}</span></div><div className="mood-title-row"><strong>{mood.label}</strong><span>{mood.opposite}</span></div><input aria-label={mood.label + " to " + mood.opposite} type="range" min="0" max="100" value={moodValues[index]} onChange={(event) => setMoodValues((values) => values.map((value, item) => item === index ? Number(event.target.value) : value))} /></div>)}
            <button className="reset-moods" onClick={() => setMoodValues([32, 58, 66])}><Minus size={14} /> RESET THE DIALS</button>
          </div>
          <motion.div className="mood-result" key={activeMood.name} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={motionTransition}>
            <div className="result-top"><Compass size={20} /><span>YOUR NEXT DIRECTION</span></div><span className="result-asterisk">✳</span><h3>{activeMood.name}</h3><p>{activeMood.detail}</p><div className="result-tags">{activeMood.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="result-foot"><span>{filteredBooks.length} illustrated shelf prompts</span><a href="#visit">Explore in person <ArrowUpRight size={14} /></a></div>
          </motion.div>
        </div>
        <div className="mood-filtered-grid"><AnimatePresence mode="popLayout">{filteredBooks.slice(0, 4).map((book) => <motion.button key={book.id} className="mini-book" layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }} onClick={() => setSelected(book)}><span className={"mini-book-dot dot-" + book.colour} /><span><strong>{book.category}</strong><small>{book.mood}</small></span><ArrowUpRight size={15} /></motion.button>)}</AnimatePresence></div>
      </section>

      <section className="blind-date-section section-wrap" id="blind-date">
        <div className="section-label"><span>04 / A LITTLE MYSTERY</span><span>NO SPOILERS. JUST CURIOSITY.</span></div>
        <div className="blind-date-grid">
          <div className="blind-date-copy"><span className="eyebrow">THE BLIND DATE WITH A BOOK</span><h2>Some stories<br />are better <em>unwrapped.</em></h2><p>Three clues. One direction. Let the riddle send you toward a corner of the shop you might not have explored.</p><span className="blind-date-disclaimer">A PLAYFUL DISCOVERY PROMPT — NOT A SPECIFIC BOOK OFFER.</span></div>
          <div className="mystery-stage">
            <motion.button className={"mystery-parcel" + (revealed ? " parcel-open" : "")} onClick={() => setRevealed((value) => !value)} whileHover={reduceMotion ? {} : { rotate: [-1, 1, -1, 0], y: -5 }} whileTap={{ scale: 0.97 }} aria-expanded={revealed} aria-label={revealed ? "Hide mystery clue" : "Unwrap the mystery clue"}>
              <span className="parcel-string string-one" /><span className="parcel-string string-two" /><span className="parcel-seal">A</span><span className="parcel-label">{revealed ? "A CLUE REVEALED" : "OPEN WHEN CURIOUS"}</span><span className="parcel-action">{revealed ? "WRAPPED AGAIN" : "UNWRAP THE STORY"} <ArrowUpRight size={14} /></span>
            </motion.button>
            <AnimatePresence mode="wait"><motion.div className="riddle-card" key={revealed ? mysteryIndex : "closed"} initial={{ opacity: 0, y: 14, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -10 }} transition={motionTransition}>{revealed ? <><span className="eyebrow">YOUR THREE-WORD RIDDLE</span><h3>{mysteries[mysteryIndex].riddle}</h3><strong>{mysteries[mysteryIndex].reveal}</strong><p>{mysteries[mysteryIndex].description}</p><button className="text-link" onClick={nextMystery}>Try another riddle <ArrowRight size={14} /></button></> : <><span className="eyebrow">A NOTE FROM THE STACKS</span><h3>Curiosity<br />looks good<br />on you.</h3><p>Tap the parcel to reveal a small nudge toward your next browsing adventure.</p></>}</motion.div></AnimatePresence>
          </div>
        </div>
      </section>

      <section className="reading-nook-section section-wrap" id="reading-nook">
        <div className="section-label"><span>05 / YOUR READING NOOK</span><span>A LITTLE PILE OF POSSIBILITIES</span></div>
        <div className="nook-heading"><div><span className="eyebrow">KEEP THE FINDS YOU LIKE</span><h2>Leave a book<br /><em>by the bedside.</em></h2></div><p>Save the shelf prompts that catch your eye. Your reading nook stays in this browser — it's a personal shortlist, not a shopping cart or a reservation.</p></div>
        <div className="nook-desk">
          <div className="nook-stack" aria-label={savedBooks.length + " saved discoveries"}>
            <AnimatePresence mode="popLayout">
              {savedBooks.length ? savedBooks.map((book, index) => <motion.button key={book.id} className={"nook-book nook-" + book.colour} layout initial={{ opacity: 0, y: -55, rotate: -9 }} animate={{ opacity: 1, y: index * 3, rotate: (index % 2 ? 1 : -1) * (index + 2) }} exit={{ opacity: 0, x: 90, rotate: 14 }} transition={motionTransition} onClick={() => toggleSaved(book.id)} aria-label={"Remove " + book.title + " from reading nook"}><span>{book.title}</span><small>REMOVE −</small></motion.button>) : <div className="nook-empty"><BookOpen size={34} /><strong>Your stack is waiting.</strong><span>Open a cover and save a discovery to start your pile.</span><a href="#shelves">Browse the shelves <ArrowUpRight size={14} /></a></div>}
            </AnimatePresence>
          </div>
          <div className="nook-note"><span className="eyebrow">THE LITTLE THINGS ADD UP</span><strong>{savedBooks.length.toString().padStart(2, "0")}</strong><span>DISCOVERIES SAVED</span><p>Good things are worth keeping close.</p><button className="reset-moods" onClick={() => { setSaved([]); setNotice("Your reading nook is clear"); }} disabled={!saved.length}>CLEAR THE STACK <X size={13} /></button></div>
        </div>
        <div className="nook-foot"><span><Sparkles size={14} /> YOUR SAVED LIST IS STORED ON THIS DEVICE</span><span>NO PURCHASE OR ONLINE ORDERING</span></div>
      </section>

      <section className="visit-section section-wrap" id="visit">
        <div className="section-label"><span>06 / FIND THE BOOKSHOP</span><span>327 RIDEAU STREET · OTTAWA</span></div>
        <div className="visit-grid">
          <div className="visit-copy"><span className="eyebrow"><span className="live-dot" /> THE DOOR IS ON RIDEAU STREET</span><h2>Come in.<br /><em>Look around.</em><br />Stay awhile.</h2><p>All Books is a compact, densely stocked second-hand bookshop. Come with a title in mind or leave room for a surprise. For a specific book, call ahead — the collection isn't searchable online.</p><div className="visit-address"><MapPin size={20} /><div><strong>ALL BOOKS</strong><span>327 Rideau Street<br />Ottawa, Ontario K1N 5Y4</span></div></div><div className="visit-actions"><a className="button button-gold" href={mapUrl} target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={16} /></a><a className="phone-link" href="tel:+16137899544"><Phone size={16} /> (613) 789-9544</a></div><p className="hours-note">Hours can change — please call ahead before making the trip.</p></div>
          <div className="shop-card"><div className="shop-card-top"><span>THE USEFUL DETAILS</span><span>OTTAWA / ON</span></div><div className="shop-illustration"><div className="shop-window"><span>ALL<br />BOOKS</span><BookOpen size={52} strokeWidth={1} /><small>SECOND-HAND BOOKS</small></div><div className="shop-plant">✳</div></div><div className="shop-card-links"><a href={mapUrl} target="_blank" rel="noreferrer"><MapPin size={17} /><span><strong>Find the shop</strong><small>327 Rideau Street, Ottawa</small></span><ArrowUpRight size={16} /></a><a href="tel:+16137899544"><Phone size={17} /><span><strong>Call ahead</strong><small>(613) 789-9544</small></span><ArrowUpRight size={16} /></a><a href={abeBooksUrl} target="_blank" rel="noreferrer"><BookOpen size={17} /><span><strong>Online book listings</strong><small>Browse the AbeBooks page</small></span><ArrowUpRight size={16} /></a></div><div className="shop-card-bottom">A GOOD BOOK IS CLOSER THAN YOU THINK.</div></div>
        </div>
      </section>

      <section className="closing-section"><div className="closing-star">✳</div><span className="eyebrow">THE NEXT CHAPTER IS OUT THERE</span><h2>See you between<br /><em>the shelves.</em></h2><a href={mapUrl} target="_blank" rel="noreferrer" className="button button-outline">Find All Books <ArrowUpRight size={16} /></a></section>

      <footer className="site-footer"><a className="footer-brand" href="#top">ALL BOOKS<small>SECOND-HAND BOOKS · OTTAWA</small></a><span>INDEPENDENTLY MINDED. DEEPLY STACKED.</span><div><a href="tel:+16137899544">CALL THE SHOP</a><a href="#visit">FIND US <ArrowUpRight size={13} /></a></div><small>© {new Date().getFullYear()} ALL BOOKS · RIDEAU STREET, OTTAWA</small></footer>

      <AnimatePresence>{notice && <motion.div className="toast-notice" role="status" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}><Check size={16} /> {notice}</motion.div>}</AnimatePresence>
    </main>
  );
}
