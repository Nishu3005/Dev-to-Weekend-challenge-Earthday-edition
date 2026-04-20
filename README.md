# GreenGate 🌿

**Autonomous Procurement Guardian** — Earth Day Weekend Challenge

GreenGate intercepts institutional procurement requests, calculates the real hidden ecological cost using Gemini AI, checks against sustainability goals, and lets an AI agent securely draft a greener Purchase Order — all visualised in a live animated world scene.

---

## Quick Start

**Prerequisites:** Python 3.8+ and Node.js 18+

```bash
python start.py
```

That's it. The script installs all dependencies on first run, starts both servers, and opens the browser automatically.

- Frontend → <http://localhost:5173>
- Backend  → <http://localhost:3001>
- Press **Ctrl+C** to stop

---

## API Keys (all optional)

The app ships with mock fallbacks — runs fully without any keys. To activate real integrations, enter them in the **API Keys & Credentials** panel in the UI. No `.env` editing required.

| Key | Effect |
|---|---|
| Gemini API Key | Real LCA on any product you type |
| Backboard API Key + Project ID | Live institutional goal checks |
| Auth0 Domain / Client / Secret / Audience | Authenticated M2M PO execution |
| Snowflake Account + Credentials | Real immutable vault logging |

Keys are sent only to your local backend and never stored.

---

## How It Works

1. **Select** a preset product or type any product + quantity
2. **Gemini LCA** calculates deforestation (trees), water (litres), carbon (kg CO₂e)
3. **Backboard** flags breaches of institutional sustainability limits
4. The **animated world scene** shows a lumberjack chopping, water flowing river → tanks → factory — all scaled to real ecological numbers
5. **Approve** the sustainable alternative to trigger Auth0 M2M execution
6. Transaction is **logged to Snowflake** and savings are displayed

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI Brain | Google Gemini `gemini-2.5-flash` |
| Memory | Backboard (Institutional Sustainability Goals) |
| Execution | Auth0 for Agents (M2M) |
| Data Vault | Snowflake (`procurement_logs`) |
| Frontend | React + Vite + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express |
| Dev Accelerator | GitHub Copilot |

---

## Project Structure

```
├── backend/
│   ├── server.js              # Gemini → Backboard → Auth0 → Snowflake pipeline
│   └── .env.example
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── ProcurementForm.jsx
│       │   ├── EcologicalVisualizer.jsx
│       │   ├── CombinedWorldScene.jsx   # Animated SVG world
│       │   └── ApiKeysPanel.jsx         # Live key entry
│       └── data/presetProducts.js       # 7 offline presets
├── database/snowflake_schema.sql
├── start.py                   # One-command launcher
└── spec.md
```

---

Built for the **DEV.to Earth Day Weekend Challenge 2026**.
