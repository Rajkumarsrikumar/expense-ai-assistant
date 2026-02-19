# STE Project – Figma design notes

Use this to document screens and components from your Figma so you can build or align the Power Apps app.

**Figma prototype:**  
[STE Project](https://www.figma.com/proto/UJaRCWqNcrU7Fwv74HKC5M/STE-Project?node-id=290696-2912&viewport=928%2C1420%2C0.16&t=IEj6wqlQQ0Fmedam-0&scaling=scale-down&content-scaling=fixed&starting-point-node-id=290696%3A2912)

**Design file link (for Power Apps import):**  
Get from Figma: File → Share → Copy link.  
Paste here: `_________________________________________________`

**Device:** iPad Pro 11" (tablet layout)

---

## Screens / Frames

| # | Screen name (Figma) | Node ID | Power Apps screen name | Notes |
|---|---------------------|--------|------------------------|-------|
| 1 | Team selection / Landing | 290696-2912 | TeamSelectionScreen | ST Engineering logo, grid of team cards |
| 2 | Home dashboard | 290997-29393 | HomeScreen | Side nav, KPIs, Accept New Inventory, table |
| 3 | Item detail | *(add node when found)* | ItemDetailScreen | PO/Invoice/Supplier/Date/Status; back to Home |
| 4 | Accept New Inventory | *(add node when found)* | AcceptInventoryScreen | Form: PO No., Invoice No., Supplier, Date, Submit/Cancel |

---

## Key components per screen

### Screen 1 – Team selection
- **Header:** ST Engineering logo (red star + "ST Engineering" text).
- **Main:** Grid of team cards (circular profile image + team name):
  - DR Team, QA Team, R&D Team, Air Force Team (and possibly more).
- **Layout:** 2–3 columns, responsive.

### Screen 2 – Home dashboard
- **Top bar:** Hamburger menu, ST Engineering logo, user "Michelle Tay" / "QR Team", search icon.
- **Left nav:** Home (active) + other menu icons.
- **Main – Home section:**
  - Title: "Home".
  - Four KPI cards: Items (500), Damaged Items (30), Unprocessed (5), Missing Data (10).
  - Button: "Accept New Inventory" (blue, plus icon).
- **Main – Table section:**
  - Title: "New Items Pending Checks".
  - Search box (placeholder "Search..."), "All Status" dropdown.
  - Data table columns: PO No., Invoice No., Supplier, Date Received, Status.
  - Rows: e.g. "PO-2025-INV-008-00123", status "Pending Receipt Processing" (blue) or "QC Completed" (green), arrow for details.
  - Pagination: "1 to 7 of 100 entries", first/prev/next/last.

---

## Navigation flow (Figma → Power Apps)

- **Team selection → Home:** User taps a team card → navigate to HomeScreen (set `CurrentTeam` or user context).
- **Home:** Hamburger toggles side nav; table row arrow → ItemDetailScreen; "Accept New Inventory" → AcceptInventoryScreen.
- **Item detail:** Back → HomeScreen.
- **Accept New Inventory:** Submit → add item and go Home; Cancel → HomeScreen.

---

## Data to connect

- **Teams:** Team name, image URL (e.g. DR Team, QA Team, R&D Team, Air Force Team).
- **Pending items:** PO No., Invoice No., Supplier, Date Received, Status (e.g. Pending Receipt Processing, QC Completed).
- **KPIs:** Items, Damaged Items, Unprocessed, Missing Data (from same or related data source).

Suggested sources: SharePoint list(s), Dataverse table(s), or Excel until backend is ready.
