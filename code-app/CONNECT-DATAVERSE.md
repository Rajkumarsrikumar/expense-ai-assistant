# Connect STE Project Code App to Dataverse

This guide describes how to wire the STE code app to **Dataverse** (or another data source) so teams and pending items come from your environment instead of localStorage/mock data.

## Prerequisites

- Power Platform environment with **Dataverse** and **code apps** enabled (preview).
- PAC CLI authenticated and environment selected: `pac auth create`, `pac env select -env <env>`.

---

## 1. Add Dataverse as a data source

From the **code-app** folder:

```bash
pac code add-data-source -a dataverse -t <table-logical-name>
```

Example: if you have a custom table **STE Pending Item** with logical name `ste_pendingitem`, add it:

```bash
pac code add-data-source -a dataverse -t ste_pendingitem
```

Repeat for a **Teams** table if you have one (e.g. `ste_team`). The CLI updates `power.config.json` and may generate or reference types/services.

See: [Connect your code app to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse).

---

## 2. Create tables in Dataverse (if needed)

If you don’t have tables yet, create them in [Power Apps](https://make.powerapps.com) → **Tables** (or **Dataverse** → **Tables**):

**Suggested table: STE Pending Item**

| Column (logical name) | Type   | Notes                    |
|------------------------|--------|--------------------------|
| ste_pono               | Text   | PO No.                   |
| ste_invoiceno          | Text   | Invoice No.              |
| ste_supplier           | Text   | Supplier                  |
| ste_datereceived       | Text or DateTime | Date Received |
| ste_status             | Choice | Pending Receipt Processing, QC Completed, Damaged, Unprocessed, Missing Data |

**Optional: STE Team**

| Column (logical name) | Type | Notes     |
|------------------------|------|-----------|
| ste_name               | Text | Team name |
| ste_imageurl           | Text | Image URL |

Use the **logical names** from Dataverse when calling the SDK or Web API.

---

## 3. Use the Power Apps SDK in your app

After `pac code add-data-source`, the Power Apps SDK can expose **connectors** or **generated services** for your tables. Typical pattern:

1. **Get context** in your app (e.g. in `PowerProvider` or a data hook):

   ```ts
   import { getContext } from '@microsoft/power-apps/app';
   const context = await getContext();
   ```

2. Use the **connector** or **generated client** for your table (names depend on what the CLI generated). Example pattern for fetching rows:

   ```ts
   // Example only – actual API depends on pac code add-data-source output
   const response = await context.connectors['YourConnectorName'].getItems();
   ```

3. Map API responses to your app types (`PendingItem`, `Team`) and use them in `App.tsx` instead of `loadPendingItems()` / `loadTeams()`.

See the [Power Apps code apps](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/) and [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse) docs for the exact API for your environment.

---

## 4. Replace mock/storage in the app

1. **Data layer**  
   Create a small data module (e.g. `src/data/dataverse.ts`) that:
   - Uses `getContext()` and the connector/generated client to **list** and **create** pending items (and teams if applicable).
   - Maps Dataverse columns to your `PendingItem` / `Team` types.

2. **App state**  
   In `App.tsx`:
   - Replace `loadPendingItems()` / `loadTeams()` with calls to your Dataverse data layer (e.g. on mount and after add).
   - Replace `savePendingItems()` / `saveCurrentTeam()` with either no-op (data lives in Dataverse) or optional localStorage for “current team” only if you want to remember it locally.

3. **Add new item**  
   In `addPendingItem`, call your data layer to **create** a row in Dataverse, then refresh the list (or optimistically update state).

4. **Optional**  
   Keep `src/data/storage.ts` for **local dev** (no Dataverse): e.g. a flag or env check to use storage when not running in Power host.

---

## 5. Environment variables / config

If you need environment-specific table names or connector names, use a config or env (e.g. `import.meta.env.VITE_DATAVERSE_TABLE`) and pass them into your data layer. The Power Apps host may also inject config via `setConfig` from `@microsoft/power-apps/app`.

---

## Quick reference

| Task                    | Command / action |
|-------------------------|------------------|
| Add Dataverse table     | `pac code add-data-source -a dataverse -t <table-logical-name>` |
| List data sources       | Check `power.config.json` after add-data-source |
| Get context in app      | `getContext()` from `@microsoft/power-apps/app` |
| Create table in Dataverse | Power Apps → Tables → New table |
| Docs                    | [Code apps – Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse) |

Once the data layer is wired, the existing UI (Team selection, Home, Item detail, Accept New Inventory) will use Dataverse instead of mock data/localStorage.
