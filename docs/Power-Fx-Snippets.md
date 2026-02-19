# STE Project – Power Fx snippets (copy-paste)

Quick reference for formulas used in the STE Power Apps implementation.

---

## Team selection screen

**OnVisible – create Teams collection (no data source):**
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

**Gallery – Items:**
```powerfx
TeamsCollection
```

**Gallery template – navigate to Home on tap:**
```powerfx
Set( CurrentTeam, ThisItem );
Navigate( HomeScreen, ScreenTransition.None )
```

---

## Home dashboard screen

**OnVisible – sample Pending Items collection:**
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

**Table/Gallery – Items (with search + status filter):**
```powerfx
Filter(
    PendingItemsCollection,
    (IsBlank(SearchBox.Text) Or IsMatch(PONo, "*" & SearchBox.Text & "*") Or IsMatch(Supplier, "*" & SearchBox.Text & "*")),
    (StatusFilter.Selected.Value = "All Status" Or Status = StatusFilter.Selected.Value)
)
```

**Status label – Color (green for QC Completed, blue for Pending):**
```powerfx
If( ThisItem.Status = "QC Completed", Green, Blue )
```

**Row tap – select item and go to detail (when Detail screen exists):**
```powerfx
Set( SelectedItem, ThisItem );
Navigate( ItemDetailScreen, ScreenTransition.None )
```

**User/team in header (example):**
```powerfx
User().FullName
```
```powerfx
CurrentTeam.TeamName
```

---

## KPI cards (example – replace with your data source)

**Items count:**
```powerfx
CountRows( PendingItemsCollection )
```
**Damaged count:**
```powerfx
CountRows( Filter( PendingItemsCollection, Status = "Damaged" ) )
```
**Unprocessed count:**
```powerfx
CountRows( Filter( PendingItemsCollection, Status = "Unprocessed" ) )
```
**Missing Data count:**
```powerfx
CountRows( Filter( PendingItemsCollection, Status = "Missing Data" ) )
```

Use static numbers (e.g. `500`, `30`, `5`, `10`) until you connect real data.

---

## Hamburger menu (Home screen)

**Hamburger icon – OnSelect (toggle side nav):**
```powerfx
Set( NavVisible, !NavVisible )
```

**Side nav panel – Visible:**
```powerfx
NavVisible
```

**HomeScreen – OnVisible (init nav + pagination + filtered list):**
```powerfx
Set( NavVisible, true );
Set( PageSize, 7 );
Set( PageIndex, 1 );
Set( FilteredPendingItems, PendingItemsCollection )
```

**SearchBox – OnChange (refresh filter + go to page 1):**
```powerfx
Set( FilteredPendingItems, Filter( PendingItemsCollection, (IsBlank(SearchBox.Text) Or IsMatch(PONo, "*" & SearchBox.Text & "*") Or IsMatch(Supplier, "*" & SearchBox.Text & "*")), (StatusFilter.Selected.Value = "All Status" Or Status = StatusFilter.Selected.Value) ) );
Set( PageIndex, 1 )
```

**StatusFilter – OnChange:** use the same formula as SearchBox OnChange.

---

## Pagination (Home screen table)

**Filtered list (use this same formula for Gallery Items and pagination label):**
```powerfx
Filter(
    PendingItemsCollection,
    (IsBlank(SearchBox.Text) Or IsMatch(PONo, "*" & SearchBox.Text & "*") Or IsMatch(Supplier, "*" & SearchBox.Text & "*")),
    (StatusFilter.Selected.Value = "All Status" Or Status = StatusFilter.Selected.Value)
)
```

**Gallery – Items (paginated, 7 per page; uses FilteredPendingItems):**
```powerfx
FirstN( Skip( FilteredPendingItems, (PageIndex - 1) * PageSize ), PageSize )
```

**Pagination label – Text (e.g. "1 to 7 of 100 entries"):**
```powerfx
(PageIndex - 1) * PageSize + 1 & " to " & Min( PageIndex * PageSize, CountRows( FilteredPendingItems ) ) & " of " & CountRows( FilteredPendingItems ) & " entries"
```
*(Ensure FilteredPendingItems is set in HomeScreen OnVisible and in SearchBox/StatusFilter OnChange.)*

**First page – OnSelect:**
```powerfx
Set( PageIndex, 1 )
```

**Previous – OnSelect:**
```powerfx
Set( PageIndex, Max( 1, PageIndex - 1 ) )
```

**Next – OnSelect:**
```powerfx
Set( PageIndex, Min( RoundUp( CountRows( FilteredPendingItems ) / PageSize, 0 ), PageIndex + 1 ) )
```

**Last page – OnSelect:**
```powerfx
Set( PageIndex, RoundUp( CountRows( FilteredPendingItems ) / PageSize, 0 ) )
```

**Previous button – DisplayMode (disabled on first page):**
```powerfx
If( PageIndex <= 1, DisplayMode.Disabled, DisplayMode.Edit )
```

**Next button – DisplayMode (disabled on last page):**
```powerfx
If( PageIndex >= RoundUp( CountRows( FilteredPendingItems ) / PageSize, 0 ), DisplayMode.Disabled, DisplayMode.Edit )
```

---

## Item detail screen

**Back button – OnSelect:**
```powerfx
Navigate( HomeScreen, ScreenTransition.None )
```

**Labels – Text (example):**
```powerfx
SelectedItem.PONo
SelectedItem.InvoiceNo
SelectedItem.Supplier
SelectedItem.DateReceived
SelectedItem.Status
```

**Status label – Color:**
```powerfx
If( SelectedItem.Status = "QC Completed", Green, Blue )
```

---

## Accept New Inventory screen

**Back / Cancel – OnSelect:**
```powerfx
Navigate( HomeScreen, ScreenTransition.None )
```

**Submit button – OnSelect (add to collection then go home):**
```powerfx
Collect(
    PendingItemsCollection,
    {
        PONo: TextInputPO.Text,
        InvoiceNo: TextInputInv.Text,
        Supplier: TextInputSupplier.Text,
        DateReceived: TextInputDate.Text,
        Status: "Pending Receipt Processing"
    }
);
Navigate( HomeScreen, ScreenTransition.None )
```
*(Rename controls to match your form: PO No., Invoice No., Supplier, Date Received.)*
