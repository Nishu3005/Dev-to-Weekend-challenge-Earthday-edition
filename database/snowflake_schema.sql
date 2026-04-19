-- Snowflake Schema for GreenGate Data Vault
-- This handles Phase 1 Database configuration as defined in the spec.

CREATE DATABASE IF NOT EXISTS GREENGATE_DB;
USE DATABASE GREENGATE_DB;

CREATE SCHEMA IF NOT EXISTS PROCUREMENT;
USE SCHEMA PROCUREMENT;

-- Core immutable log table for procurement ecology
CREATE TABLE IF NOT EXISTS procurement_logs (
    id VARCHAR DEFAULT UUID_STRING(),
    transaction_timestamp TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
    
    -- Request details
    product_name VARCHAR NOT NULL,
    quantity INTEGER NOT NULL,
    current_budget DECIMAL(10, 2),
    
    -- Selected Alternative Details
    alternative_selected VARCHAR NOT NULL,
    
    -- Ecological Metrics Saved
    deforestation_cost_trees_saved DECIMAL(10, 4),
    water_cost_liters_saved DECIMAL(10, 4),
    carbon_cost_kg_saved DECIMAL(10, 4),
    
    -- Audit details
    agent_auth_id VARCHAR, -- Stores the Auth0 Machine-to-Machine token info/ID
    
    CONSTRAINT pk_procurement_log PRIMARY KEY (id)
);
