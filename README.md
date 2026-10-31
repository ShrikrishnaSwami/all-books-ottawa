# All Books — Ottawa

An immersive editorial website for All Books, the independent second-hand bookstore at 327 Rideau Street in Ottawa.

## Stack

- Next.js App Router + React + TypeScript
- GSAP + `@gsap/react` + ScrollTrigger
- Lucide icons
- Custom responsive CSS (no utility-template UI)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Motion architecture

The client experience uses `useGSAP` with a scoped root ref. GSAP timelines handle the intro and text stagger; ScrollTrigger handles reveal and parallax; `gsap.quickTo` powers pointer-based book tilt. The hook returns pointer-listener cleanup, and the experience respects `prefers-reduced-motion`.

## Store information

- **Address:** 327 Rideau Street, Ottawa, ON K1N 5Y4
- **Phone:** (613) 789-9544
- **Hours:** Online listings conflict. The site intentionally asks visitors to call ahead instead of presenting potentially inaccurate hours.
- **Online book listing:** [All Books on AbeBooks](https://www.abebooks.com/all-books-ottawa-ottawa-on-canada/52468515/sf)

The map panel is an original schematic illustration, not a surveyed street map. It is marked as not to scale and links to Google Maps for real navigation.

## Accuracy note

The illustrated archive covers are visual artwork, not a representation of current inventory. Book stock changes constantly; no sample titles or live availability are claimed.

## Local reference sources

- [Downtown Rideau — All Books directory](https://downtownrideau.com/directory/all-books/)
- [Downtown Rideau — Ottawa bookstore feature](https://downtownrideau.com/6-safe-havens-for-bookworms-in-ottawas-original-downtown/)
- [All Books — AbeBooks listing](https://www.abebooks.com/all-books-ottawa-ottawa-on-canada/52468515/sf)
