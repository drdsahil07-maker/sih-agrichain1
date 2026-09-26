export type Role = 
  | 'farmer' 
  | 'transporter' 
  | 'aggregator' 
  | 'fpo' 
  | 'buyer' 
  | 'consumer' 
  | 'admin' 
  | 'judge';

export type QualityGrade = 'Grade A' | 'Grade B' | 'Grade C';

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  acres: number;
  crops: string[];
  trustScore: number;
}

export interface Harvest {
  id: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  quantityKg: number;
  location: string;
  harvestDate: string;
  sellingWindow: string;
  minAcceptablePrice: number;
  qualityGrade: QualityGrade;
  status: 'pending' | 'pooled' | 'compiled' | 'matched' | 'in_transit' | 'delivered' | 'settled';
  photoUrl?: string;
  aiQualityConfidence?: number;
  selectedChainId?: string;
  poolId?: string;
  createdAt: string;
}

export interface CostBreakdown {
  buyerPrice: number;
  aggregationFee: number;
  transportCost: number;
  gradingFee: number;
  storageFee: number;
  financeCost: number;
  platformFee: number;
  farmerNetValue: number;
}

export interface ChainNode {
  id: string;
  role: string;
  name: string;
  feePerKg: number;
  timeHours: number;
  isServiceOnly: boolean;
  serviceType?: string;
  reliabilityScore: number;
}

export interface ChainOption {
  id: string;
  title: string;
  type: 'trader_mandi' | 'dynamic_pool' | 'fpo_route' | 'direct_buyer' | 'mandi_direct';
  description: string;
  nodes: ChainNode[];
  breakdown: CostBreakdown;
  farmerNetValue: number; // per kg
  totalFarmerPayout: number; // total ₹
  totalTransitHours: number;
  reliabilityScore: number; // 0-100
  paymentReliability: number; // 0-100
  wastageRisk: 'Low' | 'Medium' | 'High';
  logisticsRisk: 'Low' | 'Medium' | 'High';
  qualityDisputeRisk: 'Low' | 'Medium' | 'High';
  overallScore: number; // 0-100 calculated
  badge?: string;
  recommendedReason: string;
  isBestNetValue?: boolean;
}

export interface FarmerPool {
  id: string;
  poolCode: string; // e.g. "AC-POOL-1024"
  crop: string;
  totalQuantityKg: number;
  farmerCount: number;
  farmers: {
    farmerId: string;
    farmerName: string;
    quantityKg: number;
    village: string;
    lat: number;
    lng: number;
  }[];
  clusterName: string;
  destination: string;
  targetBuyerPrice: number;
  status: 'forming' | 'ready' | 'matched' | 'dispatched' | 'completed';
  transporterId?: string;
  tripId?: string;
  transporterVehicle?: string;
  estimatedSavings: number;
  createdAt: string;
}

export interface Transporter {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
  totalCapacityKg: number;
  currentLocation: string;
  currentRoute: string;
  availableCapacityKg: number;
  rating: number;
  completedTrips: number;
  trustScore: number;
  efficiencyRating?: number;
}

export interface BackhaulTrip {
  id: string;
  transporterId: string;
  transporterName: string;
  vehicleType: string;
  primaryRoute: string;
  returnRoute: string;
  origin: string;
  destination: string;
  departureTime: string;
  availableCapacityKg: number;
  standardRatePerTrip: number;
  discountedBackhaulRate: number;
  savingEstimate: number;
  status: 'open' | 'matched' | 'in_transit' | 'completed';
}

export interface Buyer {
  id: string;
  name: string;
  businessType: 'Restaurant' | 'Hotel' | 'Retailer' | 'Processor' | 'Wholesaler' | 'Institutional';
  location: string;
  contactPerson: string;
  phone: string;
  trustScore: number;
  verified: boolean;
}

export interface BuyerDemand {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerType: string;
  crop: string;
  requiredQuantityKg: number;
  qualityGrade: QualityGrade;
  requiredBy: string;
  maxLandedPrice: number;
  deliveryLocation: string;
  status: 'open' | 'matched' | 'fulfilled';
}

export interface ServiceProvider {
  id: string;
  name: string;
  type: 'Trader' | 'Aggregator' | 'Quality Assessor' | 'Cold Storage' | 'Logistics Partner';
  location: string;
  services: {
    serviceName: string;
    feePerKg: number;
    capacityPerDay: string;
    verified: boolean;
  }[];
  scorecard: {
    aggregationReliability: number;
    paymentReliability: number;
    qualityDisputeRate: number;
    avgCompletionHours: number;
    farmerNetImprovement: number;
    overallTrustScore: number;
  };
  verifiedServicesCount: number;
  quote: string;
}

export interface Transaction {
  id: string;
  harvestId: string;
  poolId?: string;
  crop: string;
  quantityKg: number;
  buyerName: string;
  grossBuyerAmount: number;
  farmerPayout: number;
  transportPayout: number;
  aggregatorPayout: number;
  qualityPayout: number;
  platformFee: number;
  status: 'buyer_escrow_funded' | 'pickup_verified' | 'delivered' | 'settled';
  pickupOtp: string;
  deliveryOtp: string;
  timeline: {
    step: string;
    timestamp: string;
    completed: boolean;
  }[];
  createdAt: string;
}

export interface QualityAnalysisResult {
  crop: string;
  estimatedGrade: QualityGrade;
  confidence: number;
  colorUniformity: number; // percentage
  visibleDefects: 'Low' | 'Medium' | 'High';
  sizeConsistency: 'High' | 'Medium' | 'Low';
  firmnessScore: number;
  recommendation: string;
  isAiAssistedEstimate: boolean;
}

export interface PriceBenchmark {
  crop: string;
  location: string;
  mandiBenchmarkMin: number;
  mandiBenchmarkMax: number;
  enamModalPrice?: number;
  currentTraderOffer: number;
  suggestedFairBandMin: number;
  suggestedFairBandMax: number;
  potentialBargainingGap: number;
  lastUpdated: string;
  source: string;
  isDemoData?: boolean;
}

export type ThreeRole = 'farmer' | 'distributor' | 'transporter' | 'consumer' | 'government_admin';
export type AppUserRole = 'farmer' | 'distributor' | 'transporter' | 'consumer' | 'buyer' | 'admin' | 'government_admin';

export interface DatabaseUserRecord {
  uid: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  role: ThreeRole;
  profileComplete: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface FarmerProfileRecord {
  uid: string;
  userId?: string;
  name: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  crops: string;
  mainCrops?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DistributorProfileRecord {
  uid: string;
  userId?: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  businessType: string;
  city: string;
  state: string;
  cropsInterestedIn: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransporterProfileRecord {
  uid: string;
  userId?: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
  vehicleCapacity: string;
  currentLocation: string;
  preferredRoutes: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ConsumerProfileRecord {
  uid: string;
  userId?: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  businessType: string;
  city: string;
  state: string;
  requiredCrops: string[];
  typicalQuantity: number;
  quantityFrequency: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthSessionUser {
  uid: string;
  userId: string;
  name: string;
  role: ThreeRole;
  lastLoginAt: string;
  phone?: string;
  email?: string;
  location?: string;
  token?: string;
  details?: Record<string, any>;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: AppUserRole;
  phone?: string;
  location?: string;
  trustScore?: number;
  createdAt: string;
  updatedAt?: string;
}

// Supabase Database Models
export interface SupabaseProfile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: ThreeRole;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface SupabaseFarmerProfile {
  id: string;
  village: string | null;
  district: string | null;
  state: string | null;
  crops: string[];
  created_at: string;
  updated_at: string;
}

export interface SupabaseDistributorProfile {
  id: string;
  business_name: string | null;
  owner_name: string | null;
  business_type: string | null;
  city: string | null;
  state: string | null;
  crops_interested_in: string[];
  created_at: string;
  updated_at: string;
}

export interface SupabaseTransporterProfile {
  id: string;
  vehicle_number: string | null;
  vehicle_type: string | null;
  vehicle_capacity: number;
  current_location: string | null;
  preferred_routes: string[];
  created_at: string;
  updated_at: string;
}

export interface SupabaseConsumerProfile {
  id: string;
  business_name: string | null;
  owner_name: string | null;
  business_type: string | null;
  city: string | null;
  state: string | null;
  required_crops: string[];
  typical_quantity: number | null;
  quantity_frequency: string | null;
  created_at: string;
  updated_at: string;
}

export interface CombinedUserProfile extends SupabaseProfile {
  farmer?: SupabaseFarmerProfile;
  distributor?: SupabaseDistributorProfile;
  transporter?: SupabaseTransporterProfile;
  consumer?: SupabaseConsumerProfile;
}

export interface BulkRequirement {
  id: string;
  consumer_id: string;
  consumer_name?: string;
  business_name?: string;
  crop: string;
  variety?: string;
  quantity: number;
  unit: string;
  quality?: string;
  quality_grade?: string;
  required_by?: string;
  delivery_location: string;
  city?: string;
  state?: string;
  target_price?: number;
  frequency: string;
  notes?: string;
  status: 'open' | 'offers_received' | 'matched' | 'accepted' | 'fulfilled' | 'cancelled';
  created_at: string;
  updated_at: string;
  offers_count?: number;
}

export interface RequirementOffer {
  id: string;
  requirement_id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_type: 'farmer' | 'distributor';
  price_per_kg: number;
  available_quantity: number;
  quality: string;
  distance_km: number;
  estimated_delivery: string;
  reliability_score: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface ConsumerOrder {
  id: string;
  consumer_id: string;
  requirement_id?: string;
  crop: string;
  quantity: number;
  unit: string;
  supplier_name: string;
  supplier_type: 'farmer' | 'distributor';
  price_per_unit: number;
  transport_name: string;
  transport_fee: number;
  total_amount: number;
  status: 'Order Placed' | 'Supplier Confirmed' | 'Transport Pending' | 'Transport Matched' | 'Out for Delivery' | 'Delivered' | 'Completed';
  delivery_address: string;
  estimated_delivery: string;
  created_at: string;
}


export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'POOLING' | 'TRANSPORT_ASSIGNED' | 'PICKUP_READY' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  pool_id?: string;
  buyer_id: string;
  crop: string;
  quantity_kg: number;
  agreed_price_per_kg: number;
  total_amount: number;
  farmer_net_value: number;
  pickup_location: string;
  delivery_location: string;
  transport_trip_id?: string;
  status: OrderStatus;
  expected_delivery_at?: string;
  created_at: string;
  updated_at: string;
  orderNumber?: string;
  quantity?: number;
  transporterName?: string;
  transporterPhone?: string;
  vehicleNumber?: string;
  eta?: string;
  totalAmount?: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status?: OrderStatus;
  new_status: OrderStatus;
  changed_by?: string;
  changed_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}
