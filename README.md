# Ivy Homes — Bengaluru Property Intelligence Portal

**Candidate:** Ankit Kumar  
**Assignment:** Software Engineering Internship, September 2026  
**City:** Bangalore | **Assigned Locality:** Indiranagar  
**Live Demo:** [https://ivy.app](https://lvy-ya0n.onrender.com/)  
**Repository:** [https://github.com/Ankit2515ry/lvy](https://github.com/Ankit2515ry/lvy)

---

## 1. How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup & Launch
```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev

# 3. Build production bundle (verified)
npm run build
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The application automatically initializes an authenticated session with `demo1@ivy.homes` and schedules background token refreshes so sessions never expire.

---

## 2. Answers to the Ten Questions

All calculations anchored to `REFERENCE = 2026-09-10T00:00:00+05:30` (IST).

| # | Metric | Value | Verification & Method |
|---|---|---|---|
| 1 | `total_listing_records` | **4700** | Paged `/v1/listings` with `limit=50` until `has_more == false` (final page at offset 4650 yielded 50 records). The documented `total: 4315` undercounted by 385 records. |
| 2 | `unique_properties` | **4381** | Deduplicated physical properties across multiple aggregator listings matching `(apartment_name, locality, bedroom, floor, total_floors, facing_direction, property_type)`. |
| 3 | `active_listings` | **3722** | Count of retrievable records with `is_live == true` (978 inactive records returned despite documentation claiming inactive records are excluded). |
| 4 | `corrupt_listing_ids` | **40 IDs** | Exactly 40 records violating physical reality (8 in each of 5 distinct categories, listed in `submission.json`). |
| 5 | `total_monthly_rent` | **₹68,51,400** | Sum of `price` across all 191 rental records in assigned locality **Indiranagar** (`total = 6851400`). |
| 6 | `avg_price_per_sqft_2bhk` | **₹11,496.64** | Computed across live 2BHK listings excluding corrupt and fake listings, normalizing square meters (<300 from MagicHomes) to square feet (`ca * 10.7639`). |
| 7 | `costliest_project` | `{"project_id": "P10068", "price_max_inr": 998000000}` | Puravankara Sanctuary (`price_max = 99.8` Cr = ₹99,80,00,000 INR). |
| 8 | `listings_last_7_days` | **149** | Count of listings posted in `[2026-09-03T00:00:00+05:30, 2026-09-10T00:00:00+05:30)` in IST (149 in IST vs 142 if naively parsed in UTC). |
| 9 | `fake_listing_ids` | **8 IDs** | Exactly 8 lead-generation bait listings where monthly rents (₹6,250 to ₹16,790) were posted as purchase prices to harvest buyer leads. |
| 10 | `projects_with_wrong_listing_count` | **127** | Projects where reported `total_listings` disagrees with active (`is_live: true`) listings linked to that project (393 match active count, 127 desynchronized). |

---

## 3. Reverse Engineering the API: What Was Wrong & What We Did

### 1. Authentication (`auth`)
- **Documented:** Pass `?api_key=...` as a query parameter. Tokens valid for 24 hours with no refresh flow.
- **Observed:** API key in query parameter returns HTTP 401; must be sent in `X-API-Key` header. `POST /auth/login` returns `access_token` (expires in 900s / 15 minutes) and `refresh_token`. Public endpoints `/v1/listings` also require Bearer authentication.
- **Solution:** Built an API service that injects headers and automatically executes background token refresh via `POST /auth/refresh` at the 12-minute mark, ensuring indefinite uninterrupted sessions.

### 2. Pagination & Completeness (`pagination`, `completeness`)
- **Documented:** Endpoints accept `page` (1-indexed) and `limit` (max 200). `total` gives the exact record count.
- **Observed:** `page` is silently ignored; only `offset` and `limit` work. Server caps `limit` at 50. The `total` field (e.g. 4315 for listings) undercounts actual data; iterating until `has_more: false` retrieved 4,700 listings, 1,900 rentals, and 520 projects.
- **Solution:** Iterated pagination strictly on `has_more` and `offset += len(results)` rather than relying on reported `total`.

### 3. Route Naming Discrepancies (`missing_endpoint`)
- **Documented:** Single listing at `GET /v1/listing/{id}`; Favourites at `/v1/favourites`; Recommendations at `/v1/listings/{id}/similar`; Aggregates at `/v1/analytics/summary`.
- **Observed:** `GET /v1/listing/{id}` 404s (actual route is plural: `GET /v1/listings/{id}`). `/v1/favourites` 404s (actual route is `/v1/saved`, where POST requires `{"listing_id": "..."}`). Both `/v1/listings/{id}/similar` and `/v1/analytics/summary` return 404 Not Found.
- **Solution:** Routed detail pages to `/v1/listings/{id}`, wired bookmarks to `/v1/saved`, and computed market analytics and comparable properties dynamically on the client.

### 4. Unit Anomalies (`units`)
- **Documented:** "Area: Square feet, integer, everywhere in the API." "Money: Indian rupees, integer, everywhere in the API."
- **Observed:**
  1. Exactly 389 listings from `magichomes` with carpet area < 300 were recorded in **Square Meters** (e.g. 75 to 154 sq m, equivalent to 800–1650 sq ft).
  2. Project prices (`price_min`, `price_max`) were reported as floating-point **Crores INR** (e.g. 1.04 Cr to 99.8 Cr) rather than integer rupees.
- **Solution:** Normalized `magichomes` metric areas to square feet (`ca * 10.7639`) with visual indicator badges, and multiplied project values by 10,000,000 to display honest INR figures.

### 5. Server-Ignored Filters (`filters`)
- **Documented:** Query parameters `min_price`, `max_price`, `furnishing`, and `project_id`.
- **Observed:** Passing these query parameters produced no change in server responses.
- **Solution:** Implemented client-side filtering pipeline ensuring price sliders, furnishing toggles, and live-status checkboxes work seamlessly.

### 6. Corrupt Listings & Lead-Generation Bait (`data_quality`, `fraud`)
- **Corrupt Records (40):** 8 with `floor > total_floors` (e.g. floor 40 of 25), 8 with `carpet_area > super_built_up_area`, 8 residential units with 0 bedrooms/bathrooms, 8 with swapped Bangalore latitude/longitude (>77°N), and 8 with negative prices.
- **Fake Bait Records (8):** 8 listings with rental figures (₹6,250 to ₹16,790) masquerading as purchase prices.
- **Solution:** Flagged these records in the UI with warning badges and excluded them from analytical computations.

---

## 4. Hypotheses Tested That Turned Out To Be Fine (Failed Hypotheses)

1. **Hypothesis: High-Frequency Contact Numbers Were Automated Lead Scrapers**
   - *Investigation:* Analyzed phone numbers appearing on 20+ listings across 10 localities (e.g. `+912000184889` with 32 listings). Hypothesized these might be fake bot accounts.
   - *Result:* Comparing descriptions, photos, and project associations showed these were legitimate multi-property brokers and agency channels operating across Bangalore. Only `+912000000700` exhibited synthetic phone formatting.

2. **Hypothesis: Rental Security Deposits Had Inflationary Unit Anomalies**
   - *Investigation:* Checked whether rental deposits (e.g. ₹6,24,000 on ₹62,400 rent) had mismatched units (months vs rupees).
   - *Result:* Deposits strictly matched standard Bangalore 10-month rental deposit norms without unit errors.

3. **Hypothesis: Coordinate Decimals Were Synthetically Jittered Around a Single Point**
   - *Investigation:* Analyzed geospatial coordinates for clusters to test whether lat/long were fabricated around city centers.
   - *Result:* Excluding the 8 swapped coordinate pairs, coordinates mapped accurately to real Bangalore neighborhood polygons (Whitefield, Indiranagar, HSR Layout).

4. **Hypothesis: Amenity Lists Contained Non-Existent Features**
   - *Investigation:* Scanned project amenities for filler or corrupted strings.
   - *Result:* All project amenity arrays were clean, standardized lowercase strings (`gym`, `pool`, `clubhouse`, `tennis court`, `jogging track`).

---

## 5. What We Would Do With Another Two Days

1. **Interactive Leaflet/Mapbox Map:** Overlay listings and builder projects on an interactive Bangalore map with neighborhood price heatmaps and commute distance circles.
2. **Automated Data Quality Middleware:** Build an automated sanitization and alert pipeline that flags suspicious new listings in real time before they reach end users.
3. **Price Drop & Availability Watcher:** Real-time email/webhook alerts when saved listings undergo price reductions or status changes.
4. **End-to-End Test Suite:** Automated Playwright integration tests asserting session refresh longevity, filter accuracy, and bookmark synchronization across browsers.
