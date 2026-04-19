# GreenGate

**Autonomous Procurement Guardian** — powered by Google Gemini AI.

GreenGate intercepts institutional procurement requests, calculates the real ecological cost using a Lifecycle Assessment engine, checks it against sustainability goals, and lets an AI agent securely draft a greener Purchase Order.

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI Brain | Google Gemini (`gemini-2.5-flash`) |
| Memory | Backboard (Institutional Goals) |
| Execution | Auth0 for Agents (M2M) |
| Data Vault | Snowflake (`procurement_logs`) |
| Frontend | React + Vite + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express |

---

## Project Structure

```
Weekendchallenge-Earthday/
├── backend/
│   ├── server.js          # Agentic API pipeline
│   ├── package.json
│   └── .env.example       # All required API keys
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── ProcurementForm.jsx
│   │   │   └── EcologicalVisualizer.jsx
│   │   └── data/
│   │       └── presetProducts.js   # 7 pre-analysed orders
│   ├── index.html
│   └── package.json
├── database/
│   └── snowflake_schema.sql
└── spec.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### 1. Clone / Open the project

```bash
cd Weekendchallenge-Earthday
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Copy the environment file and fill in your API keys:

```bash
cp .env.example .env
```

Open `.env` and add:

```
GEMINI_API_KEY=your_key_here
AUTH0_DOMAIN=your_domain.us.auth0.com
AUTH0_CLIENT_ID=your_m2m_client_id
AUTH0_CLIENT_SECRET=your_m2m_client_secret
SNOWFLAKE_ACCOUNT=your_account_locator
SNOWFLAKE_USERNAME=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=your_warehouse
```

> **Note:** The app works fully without API keys using built-in mock fallbacks. The 7 pre-loaded products require no API calls at all.

Start the backend:

```bash
npm run dev
```

Backend runs on **http://localhost:3001**

### 3. Set up the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

### 4. Open the app

Navigate to **http://localhost:5173** in your browser.

---

## How it Works

1. **Select** a pre-assessed product from the left panel, or submit a new one.
2. **GreenGate** calculates the ecological cost — trees, water, and carbon — using Gemini.
3. **Backboard** flags the request if it violates institutional sustainability goals.
4. **Approve** the sustainable alternative to trigger Auth0 M2M agent execution.
5. The transaction is **logged immutably** to Snowflake.

---

## Database Setup (Snowflake)

Run the schema file to create the vault table:

```sql
-- Found at: database/snowflake_schema.sql
CREATE TABLE procurement_logs ( ... );
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server status |
| POST | `/api/procurement/analyze` | Run Gemini LCA + Backboard check |
| POST | `/api/procurement/execute` | Auth0 execution + Snowflake log |
| GET | `/api/procurement/logs` | Retrieve session logs |
