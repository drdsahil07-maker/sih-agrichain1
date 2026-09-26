# AgriChain - Production Agricultural Value-Chain Platform

An end-to-end agricultural value-chain platform connecting farmers, distributors, transporters, and bulk consumers with transparent pricing, smart contracts, and reliable escrow-backed logistics.

## 👥 Supported Roles

The platform supports four user roles, authenticated and enforced via Supabase:

1. **🌾 Farmer**: List harvested farmgate produce, manage price expectations, form cluster pools, and track sales revenue.
2. **🏪 Distributor**: Source wholesale consignments, place direct bids, coordinate farmgate aggregation, and manage distribution orders.
3. **🚚 Transporter**: Find available freight loads, manage vehicle capacity, update transit milestones, and execute deliveries.
4. **🍽️ Consumer / Bulk Buyer**: Procure fresh farm produce in bulk directly for restaurants, hotels, messes, canteens, caterers, and food service businesses, cutting intermediary margins with farmgate freshness.

---

## 🗄️ Database Architecture (Supabase PostgreSQL)

### Primary Tables
- `profiles`: Core identity table linked directly to `auth.users(id)`
  - Columns: `id`, `full_name`, `role` (`farmer` | `distributor` | `transporter` | `consumer`), `phone`, `avatar_url`, `created_at`, `updated_at`, `last_login_at`
- `farmer_profiles`: Specific farm profiles (`village`, `district`, `state`, `crops`, `total_acreage`, `fpo_membership`)
- `distributor_profiles`: Wholesaler & trader profiles (`business_name`, `owner_name`, `business_type`, `city`, `state`, `crops_interested_in`)
- `transporter_profiles`: Fleet & logistics profiles (`vehicle_number`, `vehicle_type`, `vehicle_capacity`, `current_location`, `preferred_routes`)
- `consumer_profiles`: Bulk buyer profiles (`business_name`, `owner_name`, `business_type`, `city`, `state`, `required_crops`, `typical_quantity`, `quantity_frequency`)
- `bulk_requirements`: Tenders and procurement requirements posted by bulk buyers (`consumer_id`, `crop`, `variety`, `quantity`, `unit`, `target_price`, `delivery_location`, `frequency`, `quality_grade`, `status`, `notes`)

---

## 🧭 Key Routes

- `/choose-role`: Interactive role selection card interface
- `/login/farmer` & `/register/farmer`: Farmer portal authentication
- `/login/distributor` & `/register/distributor`: Distributor portal authentication
- `/login/transporter` & `/register/transporter`: Transporter portal authentication
- `/login/consumer` & `/register/consumer`: Bulk Buyer portal authentication
- `/farmer/dashboard`: Farmer command center
- `/distributor/dashboard`: Distributor procurement and bidding center
- `/transporter/dashboard`: Freight and dispatch coordination
- `/consumer/dashboard`: Bulk buyer dashboard
  - `/consumer/produce`: Direct farmgate marketplace
  - `/consumer/requirements`: Post & manage bulk commodity tenders
  - `/consumer/orders`: Track active and past purchase orders
  - `/consumer/tracking`: Real-time vehicle GPS & route tracking
  - `/consumer/profile`: Manage business procurement credentials
- `/profile`: Universal account management for all roles
