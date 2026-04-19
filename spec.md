# Project Specification: GreenGate (Autonomous Procurement Guardian)

## 1. Project Overview
**Name:** GreenGate
**Type:** Enterprise Full-Stack Web Application / Agentic Workflow
**Goal:** To eliminate institutional plastic waste at the source (procurement). GreenGate intercepts procurement requests, calculates the hidden ecological cost, checks the institution's environmental goals, and securely drafts alternative, sustainable Purchase Orders (POs).

## 2. Tech Stack & Prize Categories
This project integrates five key technologies to create a cohesive, enterprise-grade AI architecture.
* **Google Gemini:** The "Brain" (Environmental Lifecycle Assessment Engine).
* **Backboard:** The "Memory" (Persistent state for institutional sustainability goals).
* **Auth0 for Agents:** The "Execution Layer" (Secure authentication to draft alternative POs).
* **Snowflake:** The "Data Vault" (Immutable logging of all ecological costs and savings).
* **GitHub Copilot:** The "Dev Accelerator" (Used to rapidly generate secure API logic and SQL schemas).
* **Frontend Framework:** React.js (via Vite) + Tailwind CSS + Framer Motion.
* **Backend Framework:** Python (Flask) or Node.js (Express).

## 3. Application Architecture & UI Layout
The UI is designed as a professional institutional decision-support dashboard.

* **Left Panel (Procurement Input):**
    * Input fields: `Product Name`, `Quantity`, `Current Budget`.
    * Action Button: "Analyze Procurement Request".
* **Middle Panel (The Agentic Console):**
    * A terminal-style UI that displays real-time status updates as the 5-tier backend workflow executes (e.g., "Calling Gemini LCA...", "Checking Backboard Goals...", "Authenticating PO...").
* **Right Panel (The Ecological Visualizer & Action):**
    * Displays the data returned by Gemini and Snowflake.
    * Shows the visual deforestation grid and water drain animations.
    * Displays the Backboard contextual warning.
    * Presents a prominent "Approve Sustainable Alternative" button.

## 4. The Agentic Data Flow (Backend Logic)
When the user submits a procurement request, the backend must execute this exact sequential workflow:

### Step 1: The LCA Engine (Google Gemini)
* **Action:** Send the user's product query to Gemini using structured JSON prompting.
* **Prompt Goal:** Calculate the `deforestationCostTrees`, `waterCostLiters`, and `carbonCostKg` for the requested item and suggest a sustainable alternative.

### Step 2: Persistent Memory (Backboard)
* **Action:** Query the Backboard API to fetch the institution's current quarterly environmental goals.
* **Logic:** If the Gemini output causes the institution to fail its goals, Backboard flags the request and injects a warning into the response.

### Step 3: Secure Execution (Auth0 for Agents)
* **Action:** If the user selects the sustainable alternative, the AI Agent must act on their behalf.
* **Logic:** The backend uses Auth0 for Agents to authenticate the AI and securely interface with a mock "Vendor API" to draft a new Purchase Order without exposing human administrative credentials.

### Step 4: The Ecological Vault (Snowflake)
* **Action:** Log the entire transaction.
* **Logic:** Write the original request, the alternative selected, and the total saved metrics (water, trees, carbon) into a Snowflake database table. This data will power the institution's future compliance dashboards.

## 5. Development Phases (For AI Prompting)
* **Phase 1 (Database & Auth):** Set up Snowflake table schemas for `procurement_logs`. Configure Auth0 M2M (Machine-to-Machine) application settings for the agent. Use GitHub Copilot to generate the connection boilerplate.
* **Phase 2 (The Agentic Backend):** Build the API route that chains the API calls. Sequence: Input -> Gemini (JSON parsing) -> Backboard (State check) -> Response to UI.
* **Phase 3 (Frontend Scaffolding):** Build the 3-panel React UI. Implement the terminal-style console to give the user visual feedback of the agentic workflow.
* **Phase 4 (Integration & Execution):** Hook the frontend "Approve Alternative" button to the Auth0 PO execution layer and trigger the final Snowflake INSERT statement.
* **Phase 5 (Visual Polish):** Add the Framer Motion animations to the data outputs to make the ecological cost feel tangible.

## 6. Constraints & Rules
* **No Gamification:** This is an institutional tool. Use stark, professional styling.
* **Strict JSON:** The Gemini prompt must force `application/json` output to prevent frontend parsing errors.
* **Agentic Transparency:** The UI must always show the user what the AI is doing (via the Agentic Console) before taking action.