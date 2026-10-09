# The Venue Journal

An interactive, responsive wedding venue planning website for twelve shortlisted locations across Nova Scotia. Target wedding period: **September 2027**, around **75–125 guests**.

## Preview locally

From this repository, run:

```bash
python3 -m http.server 8100
```

Then open [http://localhost:8100](http://localhost:8100) in your browser. There is no build step or npm dependency. Internet access is required for the OpenStreetMap tile layer, Google Fonts, Leaflet, and some additional official-website gallery images.

## Venues

1. Wilson's Coastal Club, Boutiliers Point
2. The Farm at South Cove, Lunenburg
3. Quarterdeck Resort, Summerville Centre
4. Bull Point Estate, Port Mouton
5. Pomquet Beach Cottages, Pomquet
6. Anchorage House & Cottages, Hubbards
7. Ocean Bay View Luxury Guesthouse, Musquodoboit Harbour
8. Oceanstone Resort & Spa, Indian Harbour
9. Lightfoot & Wolfville Vineyards, Wolfville
10. White Point Beach Resort, Hunts Point
11. The Cable Wharf, downtown Halifax
12. Saraguay House, Halifax

Each profile includes capacities and caveats, reception and ceremony descriptions, on-site accommodation, mandatory booking conditions, verified publicly advertised rate references where available, included and excluded items, known restrictions, enquiry questions, primary sources, and photos.

## Interactive features

* Browse all eight venues with image-led cards, search, region filtering, a guest-count selector, sorting and a strict published-capacity filter.
* Open each venue for detailed information, photos and photo lightbox, included and excluded services, pricing context, questions to ask, links to official sources and Google Maps.
* Compare venues in a horizontally scrollable table with saved-only and all-venue modes.
* Browse all venue pins on an interactive OpenStreetMap map.
* Save favourites and record enquiry statuses, your own venue-fee quotations, and personal notes.
* Build rough budgets with editable guest count, per-person food and drinks, service gratuity, taxes and other on-site expenses.
* Export a JSON backup of your favourites, notes, estimates and source references, or a CSV of the comparison.
* Start an email enquiry for September 2027, with important venue-specific questions prefilled.

**Important:** Favourites and notes are saved only to the current browser using `localStorage`. They do not sync across devices. Export periodically.

## Research caveats

This is a personal decision-support journal, not an official wedding booking service. Venue pricing, capacities, cutoffs, restrictions and availability must be confirmed directly for the specific September 2027 Saturday.

Pricing types are deliberately kept separate:

* **Published venue-space fee**: The Farm at South Cove advertises a $4,500 + HST venue-space package; this has **not** been verified as its September 2027 Saturday wedding package or full 2027 wedding rate. Advertised 2 PM–10 PM access requires clarification.
* **Published wedding package**: Anchorage House's advertised $8,500 + HST package covers weddings up to 80 guests.
* **Published venue/day rate**: Pomquet's Event Centre advertises $1,200/day; verify current fee and cleaning/add-ons.
* **Tax-included package**: Ocean Bay View advertises $6,000 including a two-night whole-house stay, with a 50-person event limit and an additional refundable security deposit.
* **Historical pricing only**: Oceanstone's 2025 weekend package specifies a $10,000 facility fee plus a $14,000 food-and-beverage minimum **before compulsory two-night accommodation bookings**. Its current 2027 guide lists facility inclusions and notes that resort exclusive use is conditional on reserving all 21 accommodation units, but does not publish the 2027 wedding fee. Do not treat the older minimum as a current quote.
* **Quote required**: Wilson's Coastal Club, Quarterdeck and Bull Point.

**The budget explorer is illustrative only.** It cannot price unknown mandatory cottage buyouts, may understate extra service and tent costs, and does not include the complete wedding. For a fair comparison, request an itemized proposal with taxes, gratuities, venue hours and any room guarantee in writing.

## Sources and photo rights

Each venue profile has links to the official venue websites, booking packages, and published policies that informed the research, reviewed October 8, 2026.

Photographs are sourced from the venues' public websites. Eight albums now contain 11–13 photos each, optimized and stored locally under the assets folder. Additional image origins are indexed in assets/photo-sources.json, and the viewer links directly to source pages.  Optimized hero images are maintained in `assets/` solely as reference material for private wedding planning, and galleries credit the original property/photographers where possible. The venue owners and photographers retain their copyrights. **No rights to re-publish or commercialize these images are asserted. Do not publish this website publicly without checking image usage permissions or replacing the images with licensed materials.**

## Repository structure

* `index.html`: Application layout
* `styles.css`: Responsive typography and visual design
* `venues.js`: Curated research records, sources, coordinates and images
* `app.js`: Client-side interactivity and browser-only persistence
* `assets/`: Optimized venue images for robust preview

There is no analytics, tracking, account login, server-side persistence or automatic booking.

### Expanded gallery browsing

Each venue has an 11–13-image gallery featuring ceremony and reception spaces, coastal views, and accommodations. Click a photo to open the full-screen gallery, and use the arrow buttons or left/right keyboard keys to browse. View photo source opens the original page.

### Quick photo browsing

Venue cards and profile headers show subtle previous/next controls **only on mouse hover** or keyboard focus. On touchscreens, swipe horizontally across a featured photo to switch images. Click or tap a photo or the View photos link to open the large gallery at the selected image.

Typography has been increased across the site for improved readability on desktop and mobile.

### October 2026 additions

Four additional venues are included with curated local galleries and full package notes: **Lightfoot & Wolfville Vineyards, White Point Beach Resort, The Cable Wharf, and Saraguay House**.

Lightfoot & Wolfville's complete **2027 official wedding package PDF** is saved in assets/packages/lightfoot-wolfville-2027-official.pdf. Its September hospitality fee is $10,500 before food, beverages, gratuity and tax. The standard venue timeline ends at 12:30 AM (music by midnight). The brochure states that the winery is not fully private without an additional exclusivity package.

White Point publishes a $6,500 oceanside lawn ceremony fee (its website still displays an outdated 15% HST number, so obtain a new quote), but its September 2027 reception rental and menus are unverified. No wedding ceremony is permitted on the sandy beach. Cable Wharf's published general private-events capacity of 300 is **not confirmed as a seated wedding capacity**. Saraguay House's published wedding rental is $3,000 + $650 ceremony, with 115 capacity and food $50-$66 per head before applicable charges. All rates require fresh quotes.

### Photographers

A separate **Photographers** tab includes Hugh Whitaker, a sample portfolio image, his official 4-, 8- and 10-hour package pricing, optional upgrades, source links, contact page, and locally saved enquiry/quote notes. The photographer can be saved to the shared shortlist and included in the journal export. Portfolio photos and wedding brochure imagery remain copyright of their owners and are included for private planning reference only.
