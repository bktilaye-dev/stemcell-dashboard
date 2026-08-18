# StemCell Dashboard — Setup

## Requirements

- Node.js 18+ (download from https://nodejs.org)
- npm (comes with Node.js)

## Run it

```bash
cd C:\Users\biruk\autism-stemcell-dashboard
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Add a new provider

### Option A — Admin form (easiest)
1. Go to http://localhost:5173/admin
2. Fill in what you know
3. Click "Generate JSON Record"
4. Copy the JSON output
5. Open `src/data/providers.json` and paste it as a new item in the array (before the closing `]`)
6. Save the file — the dashboard live-reloads automatically

### Option B — Edit JSON directly
Open `src/data/providers.json` in any text editor.
Add a new object to the array following the same shape as the existing entries.
Required fields: `id`, `name`, `location`, `cellTypes`, `deliveryRoutes`, `cellSource`, `humanCellsOnly: true`

## Dashboard features

- **Filter bar** — filter by country, cell type, delivery route, evidence level, and max cost
- **Sortable table** — click any column header to sort
- **Provider detail** — click a provider name to open the full profile with publications, testimonials, cost
- **Compare mode** — check 2–3 providers, click "Compare" to see them side-by-side with an effectiveness radar chart
- **World map** — pins colored by cell type; click a pin to highlight the provider
- **Add Provider button** — goes to /admin

## Cell type colors on map

- Purple — MUSE / Dezawa
- Cyan — Umbilical Cord MSC
- Blue — Cord Blood HSC
- Amber — Bone Marrow MSC
- Red — Spinal Cord Derived
