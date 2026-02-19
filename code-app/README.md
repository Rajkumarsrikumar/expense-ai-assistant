# STE Project – Power Apps Code App

This is a **Power Apps code app** (React + TypeScript SPA) that mirrors the STE Figma design: team selection, home dashboard, item detail, and accept new inventory.

- **Tech:** Vite, React 18, TypeScript, React Router, Power Apps SDK (`@microsoft/power-apps`)
- **Port:** 3000 (required by Power Apps SDK when running in Power Platform)

## Prerequisites

- [Node.js](https://nodejs.org/) LTS
- [Power Platform CLI (PAC)](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction) (for publishing to Power Apps)
- A Power Platform environment with [code apps enabled](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/) (preview)

## Quick start (local only)

```bash
cd code-app
npm install
npm run dev
```

Open **http://localhost:3000**. The app runs with **localStorage** for current team and pending items (persists across refresh). Teams list is static; pending items fall back to mock data on first load.

## Run as a Power Apps code app

1. **Authenticate and select environment:**
   ```bash
   pac auth create
   pac env select -env <your-environment-url-or-id>
   ```

2. **Initialize the code app** (if not already done):
   ```bash
   pac code init --displayName "STE Project"
   ```
   This updates `power.config.json` for your environment.

3. **Start dev with Power SDK** (optional – for connector/auth in Power host):
   ```bash
   npm run dev
   ```
   Then open the URL provided by **Power Platform Tools** in VS Code (or run `pac code run` in a second terminal and use the URL it gives). Use the same browser profile as your Power Platform tenant.

4. **Build and publish:**
   ```bash
   npm run build
   pac code push
   ```
   The app will appear in [make.powerapps.com](https://make.powerapps.com) in your selected environment.

## App structure

| Route    | Screen              | Description                                      |
|----------|---------------------|--------------------------------------------------|
| `/`      | Team selection      | ST Engineering logo + team cards (DR, QA, R&D, Air Force) |
| `/home`  | Home dashboard      | Side nav, KPIs, “Accept New Inventory”, table with search/filter/pagination |
| `/item/:id` | Item detail     | PO/Invoice/Supplier/Date/Status; Back to Home    |
| `/accept`   | Accept New Inventory | Form: PO No., Invoice No., Supplier, Date, Status; Submit/Cancel |

Data is kept in React state and persisted to **localStorage** (current team + pending items). To use **Dataverse**, see **[CONNECT-DATAVERSE.md](./CONNECT-DATAVERSE.md)** for adding a data source with `pac code add-data-source` and wiring `src/data/` to the Power Apps SDK.

## Project layout

```
code-app/
├── power.config.json    # Power Apps code app config (run pac code init)
├── src/
│   ├── main.tsx         # Entry + PowerProvider
│   ├── App.tsx          # Router + global state
│   ├── PowerProvider.tsx
│   ├── types.ts
│   ├── data/
│   │   ├── mockData.ts  # Static teams + default pending items
│   │   └── storage.ts   # localStorage load/save for team + items
│   └── pages/
│       ├── TeamSelection.tsx
│       ├── Home.tsx
│       ├── ItemDetail.tsx
│       └── AcceptInventory.tsx
├── docs/                # (in repo root) Figma notes + Power Fx snippets
└── README.md            # This file
```

## Links

- [Power Apps code apps (preview)](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/)
- [Create a code app from scratch](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-an-app-from-scratch)
- [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse)
- [Power Platform CLI](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction)
