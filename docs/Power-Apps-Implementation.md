# STE Project – Power Apps implementation guide

Step-by-step build for the STE app based on the Figma prototype (Team selection + Home dashboard). Use **Tablet** layout (e.g. iPad Pro 11" – 834×1194 logical).

---

## 1. App setup

1. [make.powerapps.com](https://make.powerapps.com) → **Create** → **Blank app** → **Tablet**.
2. Name the app **STE Project**.
3. Create these screens (Insert → New screen → Blank):
   - **TeamSelectionScreen** (first screen – rename default Screen1 if you prefer).
   - **HomeScreen**.
   - **ItemDetailScreen** (item detail from table row).
   - **AcceptInventoryScreen** (Accept New Inventory form).

---

## 2. Screen 1 – Team selection

### 2.1 Header – ST Engineering logo

- Add an **Image** or **HTML text** for the logo.
- Or use a **Label** with text "ST Engineering" and style (e.g. bold, size 24).
- Position at top center or top left of the screen.

### 2.2 Team cards (Gallery)

- **Insert** → **Gallery** → **Horizontal** or **Blank vertical**.
- Set **Layout** to **Title** (or custom template with Image + Label).
- **Items:** use a collection or data source.

**Option A – Static collection (no data source yet):**

On **TeamSelectionScreen** → **OnVisible**:

```powerfx
Set(
    TeamsCollection,
    [
        { TeamName: "DR Team",        ImageUrl: "" },
        { TeamName: "QA Team",        ImageUrl: "" },
        { TeamName: "R&D Team",       ImageUrl: "" },
        { TeamName: "Air Force Team", ImageUrl: "" }
    ]
)
```

- Gallery **Items:** `TeamsCollection`.
- In the gallery template:
  - **Image:** `ThisItem.ImageUrl` (or a placeholder icon if URL blank).
  - **Label:** `ThisItem.TeamName`.

**Option B – From SharePoint/Dataverse:**  
Set Gallery **Items** to your Teams list/table (e.g. `TeamsList` or `'YourTable'.Teams`).

### 2.3 Navigate to Home when a team is selected

- Select the **Gallery** (or a button inside the template).
- **OnSelect:**

```powerfx
Set( CurrentTeam, ThisItem );
Navigate( HomeScreen, ScreenTransition.None )
```

---

## 3. Screen 2 – Home dashboard

### 3.1 App bar (top)

- **Label** or **Text**: "ST Engineering" (or logo image).
- **Label**: "Michelle Tay" / "QR Team" (or `User().FullName` and `CurrentTeam.TeamName`).
- **Icon** (search): add a button with search icon; later wire to a search box or new screen.

### 3.2 Side navigation and hamburger menu

- **Hamburger** icon (top left): **OnSelect**  
  `Set( NavVisible, !NavVisible )`  
  so tapping toggles the side nav.
- **Side nav panel** (container with "Home" and other items): **Visible**  
  `NavVisible`  
  (default `NavVisible` to `true` on first load – set in HomeScreen **OnVisible**: `Set( NavVisible, true )` if not set elsewhere).
- **Vertical** layout inside the panel: **Labels** or **Buttons** for "Home" and other menu items.
- "Home" **Fill** (highlight when on Home): e.g. `If( true, LightBlue, White )` (always Home when on this screen; use a variable like `CurrentNav` if you add more main screens).

### 3.3 KPI cards (4 cards)

Create four **Cards** (e.g. **Label** inside **Rectangle** or use **Card** control if available):

| Card | Label (number) | Subtitle   | Example formula for value |
|------|----------------|------------|---------------------------|
| 1    | 500            | Items      | From data: `CountRows(ItemsList)` or `500` |
| 2    | 30             | Damaged Items | `CountRows(Filter(ItemsList, Status = "Damaged"))` or `30` |
| 3    | 5              | Unprocessed   | `CountRows(Filter(ItemsList, Status = "Unprocessed"))` or `5` |
| 4    | 10             | Missing Data  | `CountRows(Filter(ItemsList, Status = "Missing Data"))` or `10` |

Use **Labels**: one for the number, one for the title. Style with borders/background to match Figma.

### 3.4 "Accept New Inventory" button

- **Button** with text "Accept New Inventory" and plus icon.
- **OnSelect:**  
  `Navigate( AcceptInventoryScreen, ScreenTransition.None )`

### 3.5 New Items Pending Checks – data table

**Data source:** Use a collection for demo, or connect to SharePoint/Dataverse.

**Sample collection (OnVisible of HomeScreen):**

```powerfx
Set(
    PendingItemsCollection,
    [
        { PONo: "PO-2025-INV-008-00123", InvoiceNo: "772", Supplier: "Boeing Defense Systems", DateReceived: "20 Dec 2025, 09:15 AM", Status: "Pending Receipt Processing" },
        { PONo: "PO-2025-INV-007-00122", InvoiceNo: "771", Supplier: "Acme Corp", DateReceived: "19 Dec 2025, 02:30 PM", Status: "Pending Receipt Processing" },
        { PONo: "PO-2025-INV-006-00121", InvoiceNo: "770", Supplier: "Defense Supplies Ltd", DateReceived: "18 Dec 2025, 11:00 AM", Status: "QC Completed" }
    ]
)
```

**Search and filter:**

- **Text input** (placeholder "Search...") – e.g. name `SearchBox`. **OnChange:**  
  `Set( FilteredPendingItems, Filter( PendingItemsCollection, (IsBlank(SearchBox.Text) Or IsMatch(PONo, "*" & SearchBox.Text & "*") Or IsMatch(Supplier, "*" & SearchBox.Text & "*")), (StatusFilter.Selected.Value = "All Status" Or Status = StatusFilter.Selected.Value) ) ); Set( PageIndex, 1 )`  
  so the table and pagination use the same filtered list and page resets to 1.
- **Dropdown** "All Status" – e.g. name `StatusFilter`, **Items:** `["All Status", "Pending Receipt Processing", "QC Completed"]`. **OnChange:** same as SearchBox (set `FilteredPendingItems` and `PageIndex`, 1).
- **HomeScreen OnVisible:** after setting `PendingItemsCollection`, also set  
  `Set( FilteredPendingItems, PendingItemsCollection ); Set( PageIndex, 1 )`  
  so `FilteredPendingItems` is defined before first paint.

**Table:** Use a **Gallery** with **Layout** = **Title, subtitle, and body** (or custom):

- **Items (paginated):**  
  `FirstN( Skip( FilteredPendingItems, (PageIndex - 1) * PageSize ), PageSize )`  
  (FilteredPendingItems is set in OnVisible and in SearchBox/StatusFilter OnChange.)

- In template: **Labels** for `ThisItem.PONo`, `ThisItem.InvoiceNo`, `ThisItem.Supplier`, `ThisItem.DateReceived`, `ThisItem.Status`.
- **Status** label **Color:** e.g.  
  `If( ThisItem.Status = "QC Completed", Green, Blue )`.
- Add an **Icon** (arrow) or **Button**; **OnSelect:**  
  `Set( SelectedItem, ThisItem ); Navigate( ItemDetailScreen, ScreenTransition.None )`

**Pagination:**

- **Variables:** `PageSize` = 7, `PageIndex` = 1, `FilteredPendingItems` = collection (set in HomeScreen **OnVisible** and in SearchBox/StatusFilter **OnChange** as above).
- **Gallery Items (paginated):**  
  `FirstN( Skip( FilteredPendingItems, (PageIndex - 1) * PageSize ), PageSize )`
- **Pagination label** (e.g. "1 to 7 of 100 entries"):  
  `(PageIndex - 1) * PageSize + 1 & " to " & Min( PageIndex * PageSize, CountRows(FilteredPendingItems) ) & " of " & CountRows(FilteredPendingItems) & " entries"`
- **Buttons:** First: `Set( PageIndex, 1 )`; Prev: `Set( PageIndex, Max( 1, PageIndex - 1 ) )`; Next: `Set( PageIndex, Min( RoundUp( CountRows(FilteredPendingItems) / PageSize, 0 ), PageIndex + 1 ) )`; Last: `Set( PageIndex, RoundUp( CountRows(FilteredPendingItems) / PageSize, 0 ) )`.
- **Prev disabled:** `PageIndex <= 1`. **Next disabled:** `PageIndex >= RoundUp( CountRows(FilteredPendingItems) / PageSize, 0 )`.

---

## 4. Screen 3 – Item detail

- **Insert** → **New screen** → **Blank**; rename to **ItemDetailScreen**.
- **OnVisible:** no extra logic needed; **SelectedItem** is already set from the table row.
- **Back** button (top left): **OnSelect**  
  `Navigate( HomeScreen, ScreenTransition.None )`
- **Labels** to show: `SelectedItem.PONo`, `SelectedItem.InvoiceNo`, `SelectedItem.Supplier`, `SelectedItem.DateReceived`, `SelectedItem.Status`.
- **Status** label **Color:**  
  `If( SelectedItem.Status = "QC Completed", Green, Blue )`
- Add action buttons if needed (e.g. "Process", "Reject") and wire to your data source later.

---

## 5. Screen 4 – Accept New Inventory

- **Insert** → **New screen** → **Blank**; rename to **AcceptInventoryScreen**.
- **Back** button: **OnSelect**  
  `Navigate( HomeScreen, ScreenTransition.None )`
- **Form** (Insert → Form → **Edit** or **New**): connect to your inventory data source (SharePoint/Dataverse) with fields such as PO No., Invoice No., Supplier, Date Received, Status (or match your schema).
- Or use **Text inputs** and **Dropdowns** with a collection:
  - **OnSubmit** (Submit button):  
    `Collect( PendingItemsCollection, { PONo: TextInputPO.Text, InvoiceNo: TextInputInv.Text, Supplier: TextInputSupplier.Text, DateReceived: TextInputDate.Text, Status: "Pending Receipt Processing" } ); Navigate( HomeScreen, ScreenTransition.None )`
- **Cancel** button:  
  `Navigate( HomeScreen, ScreenTransition.None )`

---

## 6. Global / App-level

- **CurrentTeam:** set on Team selection (e.g. `Set(CurrentTeam, ThisItem)`), use on Home for "QR Team" or similar.
- **SelectedItem:** set when user clicks a row in the table; use on detail screen.
- **App → Start screen:** `TeamSelectionScreen` (or `HomeScreen` for testing).

---

## 7. Screen order and StartScreen

- **App** → **StartScreen:** `TeamSelectionScreen`.
- Or set **OnStart** to `Navigate(TeamSelectionScreen)` if you prefer to start on another screen and redirect.

---

## 8. Sizing (tablet)

- **App** → **App size:** Width 834, Height 1194 (or match your Figma frame).
- Resize screens and controls to match the Figma layout; use **Position** and **Size** or flex layout.

---

## 9. Next steps

- Connect **TeamsCollection** and **PendingItemsCollection** to SharePoint/Dataverse/Excel.
- Replace **AcceptInventoryScreen** form fields with your real schema and **Patch**/ **SubmitForm** to your data source.
- Add more menu items in the side nav and new screens (e.g. Reports, Settings) as in Figma.
- Add more frames from the Figma prototype (click "Next frame") and document them in `Figma-Design-Notes.md`.

Use `docs/Figma-Design-Notes.md` for the full list of screens and `docs/Power-Fx-Snippets.md` for all formulas.
