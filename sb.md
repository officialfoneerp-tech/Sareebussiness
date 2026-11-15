# SB — Saree Business: plan and rules

Working brand name: **Zarigai (ஜரிகை)**. This is a placeholder until the owner gives the real name.

## 1. Goal

A saree store that sells online and runs the business behind it:

1. **Storefront** customers love to browse (saree-themed, animated, mobile first).
2. **Backend** for products, orders, customers and payments.
3. **ERP** for stock, purchases from weavers, billing with GST, and reports.

We build the storefront demo first, review it together, improve it in rounds, and only then go live.

## 2. Rules (follow these in every session)

1. **Saree theme, not a generic clothing template.** Colours, borders and words come from the saree itself: zari, korvai temple border, pallu, Tamil colour names (arakku, mambazham, mayil kazhuthu, vadamalli).
2. **Mobile first.** Every screen must work at 400px width before desktop is polished.
3. **Animation with a purpose.** Motion shows silk, guides the eye or confirms an action. It must respect `prefers-reduced-motion` and never block content.
4. **Honest selling only.** Persuasion uses real facts. No fake reviews, fake "12 people viewing", fake countdown timers or invented certificates. "Only 2 left" must come from real stock.
5. **Demo data is marked as demo.** The ribbon stays until real products, prices and policies are in.
6. **One source of product data.** Today `assets/js/inventory.js`. Later the backend API. No product details hard-coded in pages.
7. **Fast.** No heavy libraries unless they earn their place. Target: page usable in under 2 seconds on 4G.
8. **Accessible.** Keyboard focus visible, buttons labelled, text contrast readable in light and dark.
9. **Use the right skill for the job** (section 4) and update this file when the plan or rules change.
10. **Show, review, update.** Each round ends with a demo link the owner can open on a phone.

## 3. Phases

| Phase | What | Status |
|---|---|---|
| 1 | Storefront demo: hero, occasions, collection with filters, quick view, wishlist, bag, WhatsApp order | **Done (v0.1)** |
| 2 | Review rounds: real brand name, logo, real saree photos, policies, Tamil/English toggle, product page, more sections | Next |
| 3 | Backend on Supabase: products, stock, customers, orders, login by phone OTP, admin product upload | Planned |
| 4 | Payments (Razorpay/UPI), COD, shipping partner, order tracking, WhatsApp order updates | Planned |
| 5 | ERP: inventory by piece, weaver/supplier purchases, GST invoices, returns, daily sales and profit reports, low-stock alerts | Planned |
| 6 | Go live: domain, SEO, analytics, Instagram/WhatsApp catalogue sync, launch offer | Planned |

Stack now: plain HTML, CSS and JavaScript, no build step, so GitHub Pages can host it directly.
Stack for phase 3 onward: Next.js storefront + Supabase (database, auth, storage). The design, tokens, copy and saree-art code move over as they are.

## 4. Skills in use

| Skill | How it is applied |
|---|---|
| UI/UX design | Design tokens in `assets/css/style.css`, saree-anatomy layout (pallu band, body field, zari borders), light and dark themes |
| Animation | Flowing silk canvas in the hero, silk sheen on hover, fly-to-bag, scroll reveal, drawer and quick-view motion |
| Marketing strategy | Shop by occasion, WhatsApp-first ordering, early-access list, clear promises near the price |
| Sales psychology (honest) | See section 5 |
| Frontend engineering | Data-driven rendering from one inventory file, saved bag and wishlist, no dependencies |
| Later: backend/ERP | Supabase schema design, security rules, GST billing logic |

Note: external skill packs from other GitHub repositories could not be installed in the first session because access is limited to this repository. The principles were applied directly. If the owner wants a specific skill pack, share its link.

## 5. Sales psychology used (and the honest version of each)

| Principle | Where | Rule |
|---|---|---|
| Anchoring | MRP struck through next to the price, "You save ₹X" | MRP must be the real MRP |
| Scarcity | "Only 2 left" tag and stock line | Read from real stock only |
| Goal gradient | Free-shipping progress bar in the bag | Threshold is a real policy |
| Risk reversal | 7 day returns, COD, video on WhatsApp before buying | Only promise what the shop will do |
| Fewer choices | Occasion tiles, weave and colour chips | — |
| Endowment | Wishlist heart, bag remembered on return | — |
| Reciprocity | Free fall and pico, weaver's guide to reading a saree | — |
| Authority | Weave origin on every saree, craft section in Tamil terms | Origins must be true |
| Exclusivity | WhatsApp early-access list | Really send early |
| Social proof | **Not in the demo.** Add real customer reviews and photos after launch | Never invented |

## 6. Files

```
index.html               the page
assets/css/style.css     theme tokens and all styles
assets/js/inventory.js   24 sample sarees + shop settings (free-shipping limit, WhatsApp number)
assets/js/saree-art.js   draws each saree (body, border, pallu, motif, zari) as SVG
assets/js/app.js         filters, wishlist, bag, quick view, animations
tools/build-preview.mjs  bundles everything into one file for a shareable preview
```

To add a saree: copy one entry in `assets/js/inventory.js` and change the values.

## 7. Hosting the demo on GitHub Pages

Repository → Settings → Pages → Source: **Deploy from a branch** → pick the branch and `/ (root)` → Save.
The site appears at `https://officialfoneerp-tech.github.io/Sareebussiness/` after a minute.
(Pages on a private repository needs a paid GitHub plan; a public repository is free.)

## 8. Needed from the owner

- [ ] Real brand name and logo (Zarigai is a placeholder)
- [ ] WhatsApp business number for orders
- [ ] Real saree photos (front, pallu, border, drape) or approval to keep drawn art for now
- [ ] Real categories and price range, and which weaves are actually stocked
- [ ] Policies to confirm: free-shipping limit (demo: ₹2,999), returns (demo: 7 days), COD, free fall and pico
- [ ] Languages: English only, or Tamil + English
- [ ] Target customers: local city, Tamil Nadu, all India, or NRI
