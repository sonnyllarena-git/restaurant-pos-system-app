# 🍽️ Jayden's Grill & Restaurant — POS System

A local-first, offline-capable Point of Sale (POS) system built for Jayden's Grill & Restaurant, Tanauan City, Batangas, Philippines. Runs as a Progressive Web App (PWA) — installable on desktop or mobile with no App Store required.

**Live Demo:** https://restaurant-pos-system-app.vercel.app
**Repository:** https://github.com/sonnyllarena-git/restaurant-pos-system-app

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started (Local Development)](#getting-started-local-development)
5. [Demo Login Credentials](#demo-login-credentials)
6. [Core Features](#core-features)
7. [Order Workflow](#order-workflow)
8. [Data Storage](#data-storage)
9. [Deployment (Vercel)](#deployment-vercel)
10. [Resetting Demo Data](#resetting-demo-data)
11. [Known Issues & Troubleshooting](#known-issues--troubleshooting)
12. [Roadmap / Next Steps](#roadmap--next-steps)

---

## Overview

Jayden's POS is a cash-first, offline-first restaurant point-of-sale system designed for small to medium restaurants. It supports dine-in, takeout, delivery, and advance (scheduled) orders, with a kitchen display system, table management, inventory/pricing management, and sales reporting.

The system was built as a desktop-first concept (originally planned with Electron + SQLite) but was converted into a **Progressive Web App (PWA)** using Vite + React + IndexedDB so it could be demoed instantly on any device — including iPhone — via a shareable browser link, with no installer, Mac, or App Store approval required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 (Vite) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Local Data Storage | IndexedDB (database name: `pos_system`) |
| Offline Support | Service Worker + Web App Manifest (PWA) |
| Hosting / Deployment | Vercel (auto-deploys from GitHub `main` branch) |
| Version Control | Git / GitHub (`sonnyllarena-git/restaurant-pos-system-app`) |

> **Note:** There is no backend server, no Electron desktop shell, and no SQLite database in the current build. All data lives in the browser's IndexedDB. The `desktop-app/` folder in the repo currently only contains static assets — the Electron shell was never implemented.

---

## Project Structure

```
restaurant-pos-system-app/
├── frontend/                     ← Main Vite/React app (deploy root)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           (Buttons, Modals, QuantityInput, etc.)
│   │   │   ├── modals/           (OrderSubmittedModal, ReceiptModal, etc.)
│   │   │   ├── pos/               (Wizard steps, MenuItemCard, etc.)
│   │   │   ├── inventory/         (PricingTab, EditItemModal, etc.)
│   │   │   ├── settings/          (DatabaseSettings.jsx)
│   │   │   └── navigation/        (Header, Sidebar, MobileMenu)
│   │   ├── pages/                 (HomePage, POSPage, KitchenPage, ReportsPage, etc.)
│   │   ├── services/
│   │   │   └── dbService.js       (IndexedDB read/write logic)
│   │   ├── data/                  (menuData.js, deliveryData.js)
│   │   └── styles/
│   ├── public/
│   │   ├── manifest.json          (PWA metadata)
│   │   └── service-worker.js      (Offline caching)
│   ├── package.json
│   └── vite.config.js
├── desktop-app/
│   └── assets/                    (Icons/branding only — no Electron shell yet)
└── README.md
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
git clone https://github.com/sonnyllarena-git/restaurant-pos-system-app.git
cd restaurant-pos-system-app/frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production
```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Demo Login Credentials

| Role | Username | Password |
|---|---|---|
| Admin/Owner | `admin` | `admin123` |
| Cashier | `cashier` | `password` |
| Kitchen Staff | `kitchen` | `password` |

---

## Core Features

### 🏠 Home Screen
- Six main navigation buttons: POS, Kitchen Display, Inventory, Reports, Staff Management, Settings
- Full-page Jayden's Grill logo watermark (25% opacity, centered, behind buttons)

### 🛒 Point of Sale (POS)
- **Order Type Selection** (full page): Regular Order vs. Advance Order
- **Order Wizard** (modal, step-by-step): Service Type → Table/Delivery → (Date/Time for advance) → Menu → Customer Details → Payment → Confirmation
- Mutually-exclusive selection buttons with checkmark highlighting (Service Type, Delivery Method)
- Menu items displayed as a searchable, scrollable list with image thumbnails (gray placeholder if no image uploaded)
- Search bar matches items across **all categories**, auto-switching to the correct tab
- Quantity input: type directly, or use +/− buttons; confirmation prompt if quantity exceeds 100
- Order Confirmation modal with a bold red **"📢 PLEASE READ TO CUSTOMER"** banner
- **Order Submitted modal** (both Regular & Advance orders): "Order has been submitted" with **[Home]**, **[Go to Kitchen]**, and (Regular only) **[Print Receipt]** buttons
- Total is a straight sum of item price × quantity (no subtotal/tax split — configurable later if a restaurant needs tax on receipts)

### 👨‍🍳 Kitchen Display System (KDS)
- Shows all order types (Regular + Advance) in one queue
- Status flow:
  - Regular: `pending → preparing → completed`
  - Advance: `pending → preparing → ready → payment → completed`
- Admin-only **Edit Order** while preparing (customer info, service type, table, delivery company, items) — changes sync to database, reports, table management, and receipt
- **Payment Successful modal** appears:
  - Regular orders: right after order submission
  - Advance orders: only after the kitchen marks the order **completed**
- Tabs: **Orders** | **Table Management**

### 🪑 Table Management
- 3×3 grid (9 tables)
- Green = Available, Orange/Red = Occupied (shows order IDs)
- Table only returns to Available when cashier clicks **[Done Eating]**
- Occupied tables are disabled in the POS table-selection step
- Auto-refreshes every few seconds

### 📦 Inventory Management
Two tabs:
1. **Stock Management** (existing)
2. **Pricing Management** (new)
   - List layout with item image thumbnails
   - Search across all items/categories
   - Category filter (Mains / Desserts / Drinks / Sides / Other / View All)
   - Sort by: Name (A–Z), Price (Low–High), Price (High–Low), Recently Added, Recently Updated
   - **[Edit ✏]** button opens a modal to update name, category, price, and image (JPG/PNG, max 2MB)
   - Duplicate name warning on save
   - Price changes take effect **immediately** and sync live to Checkout, Receipts, and Reports
   - **Price History** — hover over "History" to see a popup of past prices with timestamps
   - History only logs **fields that actually changed** (e.g., a name-only edit does not create a price history entry)
   - Deleting an item is blocked if it's been used in any order (completed or pending)

### 📊 Reports
Two tabs, filterable by **Today / Yesterday / This Month / Select Month**:

**Dashboard Tab**
- KPI cards: Total Orders, Revenue, Avg Order Value, Guests
- Hourly breakdown table + Revenue-by-Hour and Orders-by-Hour charts
- Top 5 Items

**Summary Tab**
- Full order log table with: Order #, Customer, **Order Type**, **Delivery Company**, **Order Source**, Items, Total, Status, Completed Time, Service Type
- Search by customer name, filter by status, sortable columns, pagination
- **[View details]** — opens a modal showing all order fields (shows "N/A" for any field that doesn't apply, e.g., Delivery Company on a Dine In order)
- **[🖨️ Print]** — reprints the original receipt for that order (same format as the original payment receipt) — useful when a customer asks for a reprinted copy
- **Export CSV** and running Total Sales figure

### 🔔 Login Price-Check Reminder
- On every login, a quick popup asks staff to confirm menu prices are current, with a checklist per category and a shortcut button straight to the Pricing tab

### ⚙️ Settings → Database
- **Clear Transactions** button: deletes all orders and resets tables to Available, while preserving menu items, staff accounts, and app settings — useful for wiping demo data before showing a new client

---

## Order Workflow

```
Home
 └── POS (full page: choose Regular or Advance)
     └── Order Wizard (modal, steps vary by order type & service type)
         └── Service Type (Dine In / Takeout / Delivery / Pickup)
         └── Table Selection (if Dine In) OR Delivery Method + Company (if Delivery)
         └── Date/Time + Order Source (Advance orders only — phone, Facebook, SMS, etc.)
         └── Menu (search, add items, adjust quantity)
         └── Customer Details / Payment
         └── Confirmation ("📢 Please read to customer") → [CONFIRM]
             └── Order Submitted Modal
                 └── Regular: [Home] [Go to Kitchen] [Print Receipt]
                 └── Advance: [Home] [Go to Kitchen]
                     └── Order appears as PENDING in Kitchen Display
                         └── Kitchen: preparing → (ready → payment, if advance) → completed
                             └── Regular: Payment Success modal shown at submission
                             └── Advance: Payment Success modal shown only now, after completion
```

---

## Data Storage

All data is stored client-side in the browser's **IndexedDB**, database name `pos_system`. There is no backend server or cloud sync in the current version.

**What this means:**
- Data persists across page reloads/app restarts on the *same device and browser*
- Data does **not** sync between devices (e.g., iPhone demo data ≠ desktop browser data)
- Clearing browser storage / site data will wipe all orders and history
- Menu items, staff accounts, and settings are seeded as mock/demo data on first load

**Reset via UI:** Settings → Database → Clear Transactions
**Reset via DevTools console** (nuclear option, clears everything including menu items):
```javascript
localStorage.clear();
indexedDB.deleteDatabase('pos_system');
location.reload();
```

---

## Deployment (Vercel)

The app auto-deploys from the `main` branch on every `git push`.

**Project settings on Vercel:**
- Framework Preset: Vite
- Root Directory: `frontend`
- Build Command: `npm run build` (or `npx vite build` if permission errors occur)
- Output Directory: `dist`
- Install Command: `npm install`

**To deploy an update:**
```bash
git add .
git commit -m "Your update message"
git push origin main
```
Vercel picks up the push automatically — no manual redeploy needed.

**Adding to iPhone Home Screen (for demos):**
1. Open the live Vercel URL in Safari
2. Tap the Share icon
3. Tap **Add to Home Screen**
4. Opens full-screen like a native app, works offline after first load

---

## Known Issues & Troubleshooting

### Vercel build fails with `Permission denied` on `vite`
This is a stale/corrupted dependency cache on Vercel's build machine, **not** a `node_modules`-in-git issue (confirmed clean in this repo).

**Fix:**
1. Go to Vercel → Deployments → **⋯** on latest → **Redeploy**
2. **Uncheck "Use existing Build Cache"**
3. Redeploy

If it persists, override the Install Command in Project Settings to force a completely clean install:
```
rm -rf node_modules package-lock.json && npm install
```

### `git push` rejected (non-fast-forward)
Happens after a local `git reset --hard` to an earlier commit, since local history now diverges from the remote. Since the reset was intentional, force-push to overwrite remote history:
```bash
git push origin main --force
```
⚠️ Use with care — this rewrites the remote branch's history.

### Data looks different on iPhone vs. desktop
Expected — IndexedDB is per-device/per-browser. There is no cloud sync yet (see Roadmap).

---

## Roadmap / Next Steps

These were discussed as future decisions, not yet built:

- [ ] Decide: fully offline desktop app (Electron) vs. cloud-hosted version for production use at the restaurant
- [ ] Optional tax/subtotal configuration on receipts (currently removed — total = flat sum of items)
- [ ] Real Electron + SQLite desktop build (if offline-only production deployment is chosen)
- [ ] Cloud backend + multi-device sync (if online production deployment is chosen)
- [ ] Password-protecting the demo URL (currently public)
- [ ] Client-specific menu/branding customization (currently generic Jayden's Grill demo data for all prospects)

---

## Business Context (Sales Reference)

This system is also being positioned as a sellable product to other small restaurants in Batangas, Philippines. See separate sales materials for:
- Package pricing (Starter ₱7,500 / Professional ₱12,500 / Premium ₱18,500)
- Launch promotions and referral program
- Monthly maintenance/support tiers (₱500–₱2,000/month)
- Sales email templates and in-person pitch script

*(Full sales pitch documentation available separately — ask if you need it regenerated.)*

---

*Last updated: July 2026*
