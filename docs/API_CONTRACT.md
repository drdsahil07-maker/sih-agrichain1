# AgriChain Backend API Contract

This document outlines the current API endpoints implemented in Phase 3 (Database Integration & Auth).

## Endpoints

### 1. Health Check
*   **Method**: `GET`
*   **Path**: `/api/health`
*   **Purpose**: Verify backend is running.
*   **Authentication requirement**: None
*   **Role requirement**: None
*   **Response**: `{ status: "ok", app: "AgriChain Compiler", tagline: string, serverTime: string }`
*   **Database dependency**: None
*   **Current status**: REAL_DATABASE

### 2. Harvests (Persistent Core Flow)
*   **Method**: `GET`
*   **Path**: `/api/harvests`
*   **Purpose**: Get all harvests (Subject to RLS).
*   **Authentication requirement**: Required (`Authorization: Bearer <token>`)
*   **Role requirement**: None
*   **Response**: `{ success: true, count: number, harvests: array }`
*   **Error cases**: `UNAUTHORIZED`, `DATABASE_ERROR`
*   **Database Dependency**: REAL_DATABASE (Supabase `harvests` table)
*   **Current status**: Migrated from SEED/DEMO to REAL_DATABASE

*   **Method**: `POST`
*   **Path**: `/api/harvests`
*   **Purpose**: Create a new harvest securely linked to the authenticated farmer.
*   **Authentication requirement**: Required (`Authorization: Bearer <token>`)
*   **Role requirement**: `farmer`
*   **Request body/query**: `crop`, `quantityKg`, `location`, `minAcceptablePrice`, `qualityGrade`, `sellingWindow`
*   **Response**: `{ success: true, harvest: object }`
*   **Error cases**: `UNAUTHORIZED`, `FORBIDDEN` (wrong role/ownership mismatch), `DATABASE_ERROR`
*   **Database Dependency**: REAL_DATABASE (Supabase `harvests` table)
*   **Current status**: Migrated from SEED/DEMO to REAL_DATABASE

### 3. Supply Chain Compiler
*   **Method**: `POST`
*   **Path**: `/api/chain/compile`
*   **Authentication requirement**: None (Demo)
*   **Database Dependency**: SEED/DEMO
*   **Current status**: SIMULATION

*   **Method**: `GET`
*   **Path**: `/api/chain/counterfactual`
*   **Authentication requirement**: None (Demo)
*   **Database Dependency**: SEED/DEMO
*   **Current status**: SIMULATION

### 4. Pools
*   **Method**: `GET`
*   **Path**: `/api/pools`
*   **Authentication requirement**: None (Demo)
*   **Database Dependency**: SEED/DEMO
*   **Current status**: Working

### 5. Transport (Backhaul)
*   **Method**: `GET`
*   **Path**: `/api/transporters/backhaul`
*   **Authentication requirement**: None (Demo)
*   **Database Dependency**: SEED/DEMO
*   **Current status**: Working

*   **Method**: `POST`
*   **Path**: `/api/transporters/backhaul`
*   **Authentication requirement**: None (Demo)
*   **Database Dependency**: SEED/DEMO
*   **Current status**: Working

### 6. Buyers
*   **Method**: `GET`
*   **Path**: `/api/buyers/demand`
*   **Authentication requirement**: None (Demo)
*   **Database Dependency**: SEED/DEMO
*   **Current status**: Working

### 7. Quality Analysis
*   **Method**: `POST`
*   **Path**: `/api/quality/analyze`
*   **Authentication requirement**: None
*   **Database Dependency**: AI
*   **Current status**: Working

### 8. Voice Processing
*   **Method**: `POST`
*   **Path**: `/api/voice/process`
*   **Authentication requirement**: None
*   **Database Dependency**: AI
*   **Current status**: Working

### 9. Call Simulation
*   **Method**: `POST`
*   **Path**: `/api/calls/simulate`
*   **Authentication requirement**: None
*   **Database Dependency**: SIMULATION
*   **Current status**: Working

### 10. Admin Dashboard
*   **Method**: `GET`
*   **Path**: `/api/dashboard/admin`
*   **Authentication requirement**: None
*   **Database Dependency**: SEED/DEMO
*   **Current status**: Working

### 11. Service Providers
*   **Method**: `GET`
*   **Path**: `/api/service-providers`
*   **Authentication requirement**: None
*   **Database Dependency**: SEED/DEMO
*   **Current status**: Working

### 12. Price Benchmarks
*   **Method**: `GET`
*   **Path**: `/api/prices/benchmark`
*   **Authentication requirement**: None
*   **Database Dependency**: SEED/DEMO
*   **Current status**: Working


### 13. Offers (Buyer/Distributor)
*   **Method**: `GET`
*   **Path**: `/api/offers`
*   **Purpose**: Get offers (optionally filtered by `?harvestId=`).
*   **Authentication requirement**: Required (`Authorization: Bearer <token>`)
*   **Role requirement**: None
*   **Database Dependency**: REAL_DATABASE (`buyer_offers`)

*   **Method**: `POST`
*   **Path**: `/api/offers`
*   **Purpose**: Create an offer for a farmer's harvest.
*   **Authentication requirement**: Required (`Authorization: Bearer <token>`)
*   **Role requirement**: `buyer`, `distributor`, or `consumer`
*   **Database Dependency**: REAL_DATABASE (`buyer_offers`)

## Farmer Net Value Formula
The system strictly enforces the following economic formula when evaluating routes in the Chain Compiler:
**Farmer Net Value (FNV) = Buyer Price - Transport Cost - Service Cost - Expected Loss**

## Environment Variables

- `VITE_SUPABASE_URL`: Public Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Public Supabase Anon Key
- `GEMINI_API_KEY`: Server-side secret for AI operations (NEVER expose to frontend).

## Authentication Implementation

Supabase Auth is handled directly in the frontend using the Supabase JavaScript client (`supabase.auth.signUp`, `supabase.auth.signInWithPassword`). The server-side API routes are now secured using a custom Express middleware (`auth.ts`) which:
1. Extracts the Bearer token.
2. Verifies the token using `supabase.auth.getUser(token)`.
3. Resolves the user identity and fetches their role from the `profiles` table.
4. Uses scoped Supabase clients initialized with the user's token so that backend operations remain bound to Supabase Row Level Security (RLS) policies.

Endpoints related to the core produce flow (e.g. `/api/harvests`) now enforce authentication and ownership.


### Pools API (Phase 5)

| Method | Endpoint | Description | Auth Required | Roles Allowed |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/api/pools` | Fetch active dynamic pools | Yes | All |
| `POST` | `/api/pools/suggest` | Generate AI candidate pools based on requirements | Yes | Admin, Aggregator |
| `POST` | `/api/pools` | Lock/Create a new pool and associate members | Yes | Admin, Aggregator |

#### Create Pool Payload:
```json
{
  "crop": "Tomato",
  "qualityGrade": "Grade A",
  "targetQuantityKg": 1000,
  "clusterName": "Indore Hub",
  "destination": "Indore City",
  "estimatedSavings": 1.50,
  "matchScore": 95,
  "farmers": [
    {
      "farmerId": "uuid",
      "harvestId": "uuid",
      "quantityKg": 250
    }
  ]
}
```
