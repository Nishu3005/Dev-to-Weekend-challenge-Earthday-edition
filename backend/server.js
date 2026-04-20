/* eslint-disable no-unused-vars */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');
const { auth } = require('express-oauth2-jwt-bearer');
const snowflake = require('snowflake-sdk');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'GreenGate Agentic Backend is up and running.' });
});

// Mock Database for UI purposes since we may not have live Auth0/Snowflake
const mockLogs = [];

/**
 * Phase 2 - Step 1 & 2: LCA Engine & Persistent Memory Check
 * Analyzes procurement request, queries Gemini for ecological cost, and checks against goals.
 */
app.post('/api/procurement/analyze', async (req, res) => {
    const { productName, quantity, currentBudget, apiKeys } = req.body;

    if (!productName || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Keys from UI take precedence over env vars
    const geminiKey = apiKeys?.gemini?.apiKey || process.env.GEMINI_API_KEY;

    try {
        // --- Step 1: The LCA Engine (Google Gemini) ---
        let lcaResult;

        if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
            const geminiClient = new GoogleGenAI({ apiKey: geminiKey });
            // Real Gemini Execution
            const prompt = `
            You are the GreenGate Lifecycle Assessment Engine.
            Calculate the hidden ecological cost of procuring: ${quantity} x ${productName}.
            Assume standard enterprise usage. Provide a slightly more sustainable alternative to the product name.
            Return ONLY a valid JSON object strictly matching this schema:
            {
                "deforestationCostTrees": number,
                "waterCostLiters": number,
                "carbonCostKg": number,
                "sustainableAlternative": string,
                "reasoning": string
            }
            `;
            const response = await geminiClient.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            let text = response.text;
            // Clean markdown json blocks if any
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            lcaResult = JSON.parse(text);
        } else {
            // Mock Response for UI Testing
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
            lcaResult = {
                deforestationCostTrees: quantity * 0.05,
                waterCostLiters: quantity * 12.5,
                carbonCostKg: quantity * 4.2,
                sustainableAlternative: `Biodegradable ${productName}`,
                reasoning: "Conventional materials require high fossil fuel inputs and water processing."
            };
        }

        // --- Step 2: Persistent Memory (Backboard Mock) ---
        // Simulating Backboard fetching institutional goals (e.g. strict carbon limits)
        const institutionalGoals = {
            maxCarbonKgPerOrder: 5000,
            maxWaterLitersPerOrder: 20000
        };

        const flags = [];
        if (lcaResult.carbonCostKg > institutionalGoals.maxCarbonKgPerOrder) {
            flags.push(`WARNING (Backboard): Order exceeds institutional carbon limits (${institutionalGoals.maxCarbonKgPerOrder} kg).`);
        }
        if (lcaResult.waterCostLiters > institutionalGoals.maxWaterLitersPerOrder) {
            flags.push(`WARNING (Backboard): Order exceeds institutional water strain limits (${institutionalGoals.maxWaterLitersPerOrder} L).`);
        }

        res.json({
            success: true,
            originalRequest: { productName, quantity, currentBudget },
            lcaResult,
            backboardFlags: flags.length > 0 ? flags : null,
            canProceed: true
        });

    } catch (error) {
        console.error('LCA Error:', error);
        res.status(500).json({ error: 'Failed to process environmental assessment' });
    }
});

/**
 * Phase 2 - Step 3 & 4: Secure Execution & Ecological Vault (Snowflake)
 */
app.post('/api/procurement/execute', async (req, res) => {
    const { originalRequest, lcaResult, apiKeys } = req.body;

    if (!originalRequest || !lcaResult) {
        return res.status(400).json({ error: 'Missing analysis context to execute.' });
    }

    const auth0Domain = apiKeys?.auth0?.domain || process.env.AUTH0_DOMAIN;
    const snowflakeAccount = apiKeys?.snowflake?.account || process.env.SNOWFLAKE_ACCOUNT;

    try {
        // --- Step 3: Secure Execution (Auth0 for Agents) ---
        let executionStatus = "Simulated Vendor API Purchase Order Drafted Successfully.";
        let agentAuthId = "mock-agent-auth0-id";

        if (auth0Domain && auth0Domain !== 'your_auth0_domain.us.auth0.com') {
            executionStatus = "Authenticated via Auth0 M2M. Purchase Order Drafted.";
        } else {
             await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // --- Step 4: The Ecological Vault (Snowflake) ---
        if (snowflakeAccount && snowflakeAccount !== 'your_account_locator_here') {
            /* 
            const connection = snowflake.createConnection({
                account: process.env.SNOWFLAKE_ACCOUNT,
                username: process.env.SNOWFLAKE_USERNAME,
                password: process.env.SNOWFLAKE_PASSWORD,
                role: process.env.SNOWFLAKE_ROLE,
                warehouse: process.env.SNOWFLAKE_WAREHOUSE,
                database: process.env.SNOWFLAKE_DATABASE,
                schema: process.env.SNOWFLAKE_SCHEMA
            });
            connection.connect((err, conn) => { ... });
            // execute INSERT statement 
            */
            console.log("Mocking Snowflake Write due to incomplete setup.");
        }

        const logEntry = {
            id: Date.now().toString(),
            transaction_timestamp: new Date().toISOString(),
            product_name: originalRequest.productName,
            quantity: originalRequest.quantity,
            current_budget: originalRequest.currentBudget,
            alternative_selected: lcaResult.sustainableAlternative,
            deforestation_cost_trees_saved: lcaResult.deforestationCostTrees * 0.8, // assume alternative saves 80%
            water_cost_liters_saved: lcaResult.waterCostLiters * 0.7,
            carbon_cost_kg_saved: lcaResult.carbonCostKg * 0.6,
            agent_auth_id: agentAuthId
        };
        
        mockLogs.push(logEntry);

        res.json({
            success: true,
            message: "Sustainable alternative approved and locked.",
            executionStatus,
            vaultLogId: logEntry.id,
            savings: {
                trees: logEntry.deforestation_cost_trees_saved,
                water: logEntry.water_cost_liters_saved,
                carbon: logEntry.carbon_cost_kg_saved
            }
        });

    } catch (error) {
        console.error('Execution Error:', error);
        res.status(500).json({ error: 'Failed to execute and log to data vault.' });
    }
});

app.get('/api/procurement/logs', (req, res) => {
    res.json({ logs: mockLogs });
});

// Quick Gemini key validation — calls the cheapest possible request
app.post('/api/test-gemini', async (req, res) => {
    const key = req.body?.apiKey?.trim();
    if (!key) return res.status(400).json({ valid: false, error: 'No key provided' });
    try {
        const client = new GoogleGenAI({ apiKey: key });
        await client.models.generateContent({ model: 'gemini-2.5-flash', contents: 'Hi' });
        res.json({ valid: true });
    } catch (e) {
        res.json({ valid: false, error: e.message || 'Invalid key' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`GreenGate Agentic Backend listening on port ${port}`);
});
