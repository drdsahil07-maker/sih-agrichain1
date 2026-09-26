# Dynamic Pooling Engine

## Why dynamic pooling exists
Smallholder farmers in India often produce quantities too small (e.g., 80-120 kg) to independently hire commercial transport or directly fulfill large buyer contracts. The Dynamic Pooling Engine solves this by aggregating these small, disconnected lots into high-volume commercial consignments.

## Eligibility Rules
A produce lot can be pooled if it is:
- Created by a verified farmer.
- Unsold and uncommitted (status `compiled` or `pending`).
- Within the required selling window.

## Compatibility Rules
Lots are grouped based strictly on:
- **Commodity**: Only identical crops can be pooled (Tomato with Tomato).
- **Quality Grade**: Buyers typically demand consistent quality (e.g., Grade A cannot be mixed with Grade B).
- **Location/Geography**: Produce must originate from compatible proximity clusters to make pickup logistics viable.

## Clustering Approach
For the prototype, a deterministic clustering approach groups lots by geographic substring matching (e.g., "Sanwer", "Indore", "Dewas"). In production, this can be expanded with Density-Based Spatial Clustering of Applications with Noise (DBSCAN) using live coordinates.

## Pool Formation
1. Filter eligible lots.
2. Group by crop and quality.
3. Sub-group by geographic clusters.
4. Add lots to a pool until the target buyer quantity is met.

## Pool Lifecycle
- `forming`: Pool is partially filled but hasn't reached buyer requirement.
- `ready`: Target volume is met; ready for transport matching.
- `locked`: Confirmed and locked by aggregation center.
- `dispatched`: In transit.
- `completed`: Successfully delivered.

## Pool Membership
The system utilizes a `pool_members` bridging table holding a `UNIQUE(pool_id, harvest_id)` constraint, eliminating the risk of double-booking. Farmers can verify exactly what proportion of a pool belongs to them.

## Buyer Requirement Matching
Pools are formed specifically to satisfy active buyer requirements (e.g., a restaurant needing 1000 kg Tomato).

## Economic Calculation
Individual small-lot logistics are inherently expensive per kg. 
The pooled model estimates shared commercial logistics costs (e.g., a shared truck), leading to an `estimated_savings` rate (e.g., +₹1.50/kg). This savings rate acts as a direct uplift on the **Farmer Net Value**.

## Known Limitations
- Current geographic clustering is string-based for the SIH prototype.
- Estimated savings are static metrics used for demonstration; Phase 6 will attach actual transport contracts.
