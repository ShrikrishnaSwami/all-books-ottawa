# All Books — Ottawa

An immersive, editorial-style website concept for All Books, the independent second-hand bookshop at 327 Rideau Street in Ottawa.

> **Prototype status:** This is a presentation prototype prepared for discussion with the shop. It is not an official All Books website and must not be represented as endorsed or operated by the business until an agreement is in place.

## Run locally

    npm install
    npm run dev

Open http://localhost:3000.

## Stack

- Next.js App Router (Next.js 15)
- React 19 + TypeScript
- Tailwind CSS 4 + custom responsive CSS
- Framer Motion for entrance, layout, modal, shelf, parcel and reading-stack animations
- Lucide React icons
- Browser localStorage for the personal reading nook
- GitHub Pages static export when running in GitHub Actions

## Quality checks

    npm run typecheck
    npm run lint
    npm run build

## Experience

- Dark mahogany, midnight, parchment and brass literary visual system.
- Responsive desktop and mobile navigation.
- Interactive illustrated bookshelf with animated book selection and a shelf-side detail reveal.
- Three-axis mood discovery sliders that guide visitors toward broad shelf categories.
- Blind-date parcel with rotating three-word riddles and browsing prompts.
- Personal reading nook that saves illustrative discoveries in the visitor's browser.
- Animated literary quote marquee and atmospheric motion details.
- Address, directions, click-to-call and AbeBooks links.
- Reduced-motion support, visible keyboard focus states, semantic navigation and labelled controls.
- Escape closes the mobile navigation and book detail dialog.

## Store information represented

- **Address:** 327 Rideau Street, Ottawa, ON K1N 5Y4
- **Phone:** (613) 789-9544
- **Online book listing:** [All Books on AbeBooks](https://www.abebooks.com/all-books-ottawa-ottawa-on-canada/52468515/sf)
- **Hours:** Not displayed because public listings may conflict. Visitors are encouraged to call ahead.

Confirm all business details, links, wording, brand treatment and preferred contact methods with the owner before launch.

## Inventory accuracy and commerce

The illustrated book covers, titles, mood suggestions and riddles are creative discovery prompts. They do not represent specific titles, current stock, prices or staff recommendations. The shop does not currently provide a confirmed live inventory feed.

The reading nook is a browser-local wishlist of illustrative prompts. It is not a cart, checkout, reservation, order or inventory system. Do not add online purchasing or claim stock availability without an owner-approved inventory and commerce integration.

## Hosting and ownership handoff

For a client launch, the business should own and pay for its domain and hosting accounts.

1. The client creates and controls its own hosting account and domain registrar account.
2. The repository is transferred to a client-owned GitHub account or organization, or the client is given the agreed repository access.
3. The client connects its repository to its own hosting project.
4. The client adds the domain and updates DNS at its registrar.
5. Verify production deployment, HTTPS, redirects, metadata, contact links and mobile layouts before launch.

Do not connect the prototype to a developer-owned hosting account for the permanent production site. Any temporary preview used for a sales presentation should be clearly described as a prototype.

## Local reference sources

- [Downtown Rideau — All Books directory](https://downtownrideau.com/directory/all-books/)
- [Downtown Rideau — Ottawa bookstore feature](https://downtownrideau.com/6-safe-havens-for-bookworms-in-ottawas-original-downtown/)
- [All Books — AbeBooks listing](https://www.abebooks.com/all-books-ottawa-ottawa-on-canada/52468515/sf)
