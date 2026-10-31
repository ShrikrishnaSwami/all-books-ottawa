# All Books — Ottawa

A responsive, editorial-style website concept for All Books, the independent second-hand bookshop at 327 Rideau Street in Ottawa.

> **Prototype status:** This repository contains a presentation prototype prepared for discussion with the shop. It is not an official All Books website and must not be represented as endorsed or operated by the business until an agreement is in place.

## Preview locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Stack

- Next.js App Router
- React + TypeScript
- GSAP, `@gsap/react` and ScrollTrigger
- Lucide icons
- Custom responsive CSS

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Experience and accessibility

- Responsive navigation and layouts for desktop and mobile.
- Keyboard-operable mobile menu, Escape-to-close behavior and visible focus states.
- Reduced-motion preferences are respected.
- Contact, phone, directions and AbeBooks links are provided.
- The map graphic is explicitly schematic and links to Google Maps for navigation.

## Store information currently represented

- **Address:** 327 Rideau Street, Ottawa, ON K1N 5Y4
- **Phone:** (613) 789-9544
- **Online book listing:** [All Books on AbeBooks](https://www.abebooks.com/all-books-ottawa-ottawa-on-canada/52468515/sf)
- **Hours:** Not displayed because public listings may conflict. The prototype recommends calling ahead.

Confirm all business details, links, wording, brand treatment and preferred contact methods with the owner before launch.

## Inventory accuracy

The decorative book covers are original illustrative artwork. They do not represent specific titles, current stock, prices or live inventory. The website does not currently provide e-commerce, online ordering, stock search or inventory synchronization.

## Hosting and ownership handoff

For a client launch, the business should own and pay for its domain and hosting accounts.

1. The client creates and controls its own Vercel account and domain registrar account.
2. The repository is transferred to a client-owned GitHub account or organization, or the client is given the agreed repository access.
3. The client connects its GitHub repository to its own Vercel project.
4. The client adds the domain in Vercel and updates DNS at its registrar.
5. Verify production deployment, HTTPS, redirects, metadata, contact links and mobile layouts before launch.

Do not connect the prototype to a developer-owned hosting account for the permanent production site. Any temporary preview used for a sales presentation should be clearly described as a prototype.

## Motion architecture

The client experience uses `useGSAP` with a scoped root ref. GSAP timelines handle the intro and text stagger; ScrollTrigger handles reveal and parallax; `gsap.quickTo` powers pointer-based book tilt. Pointer listeners are cleaned up and the experience respects `prefers-reduced-motion`.

## Local reference sources

- [Downtown Rideau — All Books directory](https://downtownrideau.com/directory/all-books/)
- [Downtown Rideau — Ottawa bookstore feature](https://downtownrideau.com/6-safe-havens-for-bookworms-in-ottawas-original-downtown/)
- [All Books — AbeBooks listing](https://www.abebooks.com/all-books-ottawa-ottawa-on-canada/52468515/sf)
