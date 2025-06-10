# PLANNING.md

## Project Architecture & Goals

This project aims to source, enrich, and analyze New Zealand property listings for house flipping opportunities. The MVP must reliably ingest large volumes of property data, enrich it with official sources, and expose it via an API for frontend analysis and filtering.

### Key Components
- **Scraping Layer:** Extracts property listings from public sites (Trade Me, Realestate.co.nz, OneRoof, etc.)
- **Enrichment Layer:** Adds legal/title/geospatial data from LINZ API
- **Storage Layer:** Persists all raw and enriched data (Postgres via Supabase)
- **API Layer:** Serves property data to the frontend (Lovable.dev)
- **Analysis Layer:** Scores and analyzes properties for flip potential

---

## Scraping Plan: Migrating from Apify to AgentQL

### 1. **Why Switch?**
- **Apify** is increasingly unreliable due to anti-bot measures and dynamic content.
- **AgentQL** is AI-powered, selectorless, and more robust to layout changes, making it ideal for MVP property sourcing.

### 2. **AgentQL Integration Plan**

#### **A. Remove Apify Integration**
- Delete or refactor all Apify-specific code:
  - `shared/apify-client.ts`
  - `apify-config.ts` in each scraping function
  - Apify actor IDs and input builders

#### **B. Add AgentQL Client**
- Create `shared/agentql-client.ts`:
  - Handles authentication (API key from Supabase Edge Function secrets)
  - Sends property extraction requests to AgentQL's API
  - Handles pagination, errors, and retries

#### **C. Update Scraping Functions**
- In each function (e.g., `scrape-trademe/index.ts`):
  - Replace Apify logic with AgentQL client calls
  - Build AgentQL queries based on user filters (keywords, price, beds, suburb, etc.)
  - Parse and normalize AgentQL results to match our property schema
  - Store results in Supabase as before

#### **D. Testing & Validation**
- Test scraping for each target site (Trade Me, Realestate.co.nz, OneRoof)
- Validate that all required fields are captured and mapped correctly
- Handle edge cases (no results, partial data, API errors)

#### **E. Fallbacks**
- If AgentQL fails, allow manual CSV upload or URL input for property analysis

---

## Implementation Steps
1. **Create `agentql-client.ts`** in `shared/`.
2. **Refactor one scraping function** (e.g., `scrape-trademe`) to use AgentQL.
3. **Test end-to-end**: Ensure data flows from AgentQL to Supabase.
4. **Repeat for other scraping functions**.
5. **Remove Apify code** once AgentQL is validated.
6. **Document the new flow in `README.md`**.

---

## Considerations
- **API Key Security:** Always read AgentQL API key from Supabase Edge Function secrets.
- **Data Mapping:** Ensure all fields (address, price, beds, etc.) are mapped from AgentQL's response.
- **Error Handling:** Implement robust error and rate-limit handling.
- **Extensibility:** Design AgentQL client for easy extension to new sites or data sources.

---

## TODO
- [ ] Implement AgentQL client
- [ ] Refactor `scrape-trademe`
- [ ] Test and validate
- [ ] Repeat for other sites
- [ ] Remove Apify code
- [ ] Update documentation

---

## Phase: Codebase Cleanup & Hardening

### Tasks

- **Standardize Error Handling & Logging**
  - Review all `console.error` and thrown errors; ensure consistent logging and error reporting across backend and frontend.
  - Implement a global error boundary or toast notification system in the frontend for user-facing errors.

- **Type Safety Improvements**
  - Audit all usages of `any`, `@ts-ignore`, `@ts-nocheck`, and similar suppressions. Refactor to use strict typing where possible.
  - Ensure all arrays and function returns are explicitly typed, especially in edge functions.

- **Environment Variable Management**
  - Move hardcoded Supabase credentials in `src/integrations/supabase/client.ts` to a `.env` or `.env.local` file using Vite's `import.meta.env`.
  - Document required environment variables for local and production environments.

- **Deno/Node Compatibility Awareness**
  - Clearly document which files/functions are Deno-only (Edge Functions) and which are Node.js/browser compatible.

- **Security Review**
  - Double-check that no secrets or sensitive keys are committed to the repo.
  - Ensure all API keys and secrets are accessed via environment variables.

- **Error Propagation & User Feedback**
  - Ensure all errors that affect the user are surfaced in the UI (e.g., via toast notifications or error boundaries).
  - Review hooks and components for proper error propagation.

- **TODO/FIXME Audit**
  - Search for and address any remaining TODO or FIXME comments in the codebase.

- **Testing**
  - Add or update unit and integration tests for any refactored or critical code paths. 