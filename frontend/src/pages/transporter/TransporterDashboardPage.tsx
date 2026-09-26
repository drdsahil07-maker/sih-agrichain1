import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  LayoutDashboard, 
  PackageCheck, 
  Navigation, 
  Map, 
  DollarSign, 
  Wrench, 
  User, 
  LogOut, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight,
  Eye,
  AlertCircle
} from 'lucide-react';
import { authService } from '../../auth/authService';
import { AccountMenu } from '../../components/AccountMenu';
import { useOrders } from '../../hooks/useOrders';

interface AvailableLoadItem {
  id: string;
  crop: string;
  quantity: string;
  route: string;
  origin: string;
  destination: string;
  estimatedDistance: string;
  estimatedCost: string; // Freight payout
  requiredCapacity: string;
  pickupTime: string;
  shipper: string;
  details: string;
}

export const TransporterDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [acceptedLoads, setAcceptedLoads] = useState<string[]>([]);
  const [selectedLoadDetails, setSelectedLoadDetails] = useState<AvailableLoadItem | null>(null);
  const [showAddTripModal, setShowAddTripModal] = useState(false);

  // Return trip form state
  const [origin, setOrigin] = useState('Bhopal Bypass Terminal');
  const [destination, setDestination] = useState('Indore Naka Gate 3');
  const [capacity, setCapacity] = useState('1500 KG');
  const [departureTime, setDepartureTime] = useState('Today, 4:00 PM');
  const [publishedTrips, setPublishedTrips] = useState<number>(1);

  // Assigned Orders via real API
  const { orders: assignedOrders, loading: assignedOrdersLoading, refreshOrders } = useOrders();

  // Available Loads according to prompt requirements
  const [loadsList] = useState<AvailableLoadItem[]>([
    {
      id: 'LOAD-001',
      crop: 'Tomato',
      quantity: '640 KG',
      route: 'Indore → Bhopal',
      origin: 'Sanwer (Village Cluster A Gate), Indore',
      destination: 'Bhopal Agro Processing Hub, Mandideep',
      estimatedDistance: '185 KM',
      estimatedCost: '₹3,400',
      requiredCapacity: '800 KG Payload',
      pickupTime: 'Today 3:30 PM',
      shipper: 'Ramesh Patel (Sanwer Pool)',
      details: 'Crated hybrid grade A tomatoes, palletized for rapid loading. Direct backhaul cargo.'
    },
    {
      id: 'LOAD-002',
      crop: 'Soybean',
      quantity: '1,200 KG',
      route: 'Sanwer → Indore Central Terminal',
      origin: 'Dewas Road Farmer Collection Point',
      destination: 'Indore Devi Ahilya Terminal',
      estimatedDistance: '28 KM',
      estimatedCost: '₹1,850',
      requiredCapacity: '1,500 KG Payload',
      pickupTime: 'Today 6:00 PM',
      shipper: 'Dewas Kisan FPO Hub',
      details: 'Standard 50kg jute bags. Direct warehouse offloading.'
    },
    {
      id: 'LOAD-003',
      crop: 'Onion',
      quantity: '850 KG',
      route: 'Hatod → Dewas Mandi',
      origin: 'Hatod Farmgate Consolidation Shed',
      destination: 'Dewas Cold Storage Facility',
      estimatedDistance: '42 KM',
      estimatedCost: '₹2,200',
      requiredCapacity: '1,000 KG Payload',
      pickupTime: 'Tomorrow 7:00 AM',
      shipper: 'Mukesh Choudhary & Co-op',
      details: 'Mesh breathable bags, dry ventilation required.'
    },
    {
      id: 'LOAD-004',
      crop: 'Potato',
      quantity: '1,500 KG',
      route: 'Mhow → Ujjain Corridor',
      origin: 'Mhow Cold Cellar A',
      destination: 'Ujjain Food Distribution Terminal',
      estimatedDistance: '74 KM',
      estimatedCost: '₹2,950',
      requiredCapacity: '1,800 KG Payload',
      pickupTime: 'Tomorrow 9:00 AM',
      shipper: 'Mhow Progressive Growers',
      details: 'Chipsona grade 1 potatoes, direct factory delivery.'
    }
  ]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login/transporter');
  };

  const handleAcceptLoad = (id: string) => {
    setAcceptedLoads(prev => [...prev, id]);
  };

  const handlePublishTrip = (e: React.FormEvent) => {
    e.preventDefault();
    setPublishedTrips(prev => prev + 1);
    setShowAddTripModal(false);
  };

  const sidebarNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Available Loads', icon: PackageCheck },
    { label: 'My Trips', icon: Navigation, badge: `${publishedTrips + acceptedLoads.length}` },
    { label: 'Active Trip', icon: Truck },
    { label: 'Route', icon: Map },
    { label: 'Earnings', icon: DollarSign },
    { label: 'Vehicle', icon: Wrench },
    { label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 md:sticky md:top-0 md:h-screen">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 tracking-tight">AgriChain</div>
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Transporter Portal</div>
            </div>
          </div>
          <div className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">
            Active
          </div>
        </div>

        {/* Transporter User Card */}
        <div className="p-3 mx-3 mt-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 truncate">
              {user?.name || 'Raj Transport'}
            </div>
            <div className="text-[10px] text-blue-800 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>{user?.details?.vehicleNumber || 'MP-09-GH-4412'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-700">Driver &amp; Logistics Cockpit</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                {user?.userId || 'transporter_active'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display mt-0.5">
              Available Agricultural Loads &amp; Freight
            </h1>
            <p className="text-xs text-slate-500">
              Eliminate empty return hauls. Discover farmgate freight matching your return travel direction.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setShowAddTripModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ List Empty Return Trip</span>
            </button>

            {/* Account / Easy User Switching Menu */}
            <AccountMenu />
          </div>
        </div>

        {/* 4 DASHBOARD METRIC CARDS (Requested exactly) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Available Loads */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available Loads</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">{loadsList.length}</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1">Along Indore - Bhopal belt</div>
          </div>

          {/* Card 2: Active Trips */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Trips</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">{1 + acceptedLoads.length}</div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1">1 en route to Dewas</div>
          </div>

          {/* Card 3: Completed Trips */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Trips</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-1">26</div>
            <div className="text-[11px] text-slate-500 mt-1">100% on-time delivery rate</div>
          </div>

          {/* Card 4: Total Earnings */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Earnings</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-display mt-1">₹68,450</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">Settled automatically to UPI</div>
          </div>
        </div>

        {/* ASSIGNED ORDERS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden mb-6">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" /> My Assigned Orders
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Orders attached to your currently assigned transport trips.
              </p>
            </div>
            <button onClick={refreshOrders} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
              Refresh
            </button>
          </div>
          <div className="p-5 sm:p-6 space-y-4">
            {assignedOrdersLoading && <p className="text-sm text-slate-500">Loading assigned orders...</p>}
            {!assignedOrdersLoading && assignedOrders.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-sm">
                You have no active orders assigned to you right now.
              </div>
            )}
            {assignedOrders.map((order: any) => (
              <div key={order.id} className="border border-slate-200 rounded-xl bg-slate-50 p-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-3 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{order.crop} - {order.quantity_kg} kg</h3>
                    <p className="text-xs text-slate-500 font-mono">Order ID: #{order.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg ${
                      order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Pickup</span>
                    <span className="text-slate-800">{order.pickup_location}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Delivery</span>
                    <span className="text-slate-800">{order.delivery_location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN SECTION: "AVAILABLE LOADS" (Requested with crop, quantity, route, estimated distance, estimated cost, required capacity, View Load, Accept Load) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                Available Loads
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pre-weighed and verified consignments ready for immediate pickup and delivery.
              </p>
            </div>

            <span className="text-xs font-semibold bg-blue-50 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
              Matched for Pickup Capacity ({user?.details?.vehicleCapacity || '1,500 KG'})
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadsList.map((load) => {
                const isAccepted = acceptedLoads.includes(load.id);

                return (
                  <div 
                    key={load.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Route Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-900 font-display">{load.route}</span>
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                            {load.id}
                          </span>
                        </div>
                        <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                          {load.estimatedDistance}
                        </span>
                      </div>

                      {/* Produce & Quantity */}
                      <div className="flex items-baseline justify-between bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                        <div>
                          <span className="text-[10px] text-blue-800 uppercase font-bold block">Consignment</span>
                          <span className="text-lg font-black text-slate-900">{load.crop}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Weight</span>
                          <span className="text-base font-extrabold text-blue-900">{load.quantity}</span>
                        </div>
                      </div>

                      {/* Specific Required Fields: Estimated Distance, Estimated Cost, Required Capacity */}
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Estimated Freight Payout:</span>
                          <span className="font-extrabold text-emerald-700 text-base">{load.estimatedCost}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Estimated Distance:</span>
                          <span className="font-semibold text-slate-800">{load.estimatedDistance}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Required Capacity:</span>
                          <span className="font-semibold text-slate-800">{load.requiredCapacity}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-400">Pickup Point:</span>
                          <span className="font-semibold text-slate-700 truncate max-w-[200px]">{load.origin}</span>
                        </div>
                      </div>
                    </div>

                    {/* TWO BUTTONS: "View Load" and "Accept Load" (Requested) */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSelectedLoadDetails(load)}
                        className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Load</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAcceptLoad(load.id)}
                        disabled={isAccepted}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isAccepted
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
                        }`}
                      >
                        {isAccepted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>Load Accepted</span>
                          </>
                        ) : (
                          <>
                            <span>Accept Load</span>
                            <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </main>

      {/* VIEW LOAD DETAILS MODAL */}
      {selectedLoadDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 font-display">
                Load Details &bull; {selectedLoadDetails.id}
              </h3>
              <span className="text-xs bg-blue-50 text-blue-800 font-mono font-bold px-2 py-0.5 rounded">
                {selectedLoadDetails.route}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400">Crop &amp; Quantity:</span>
                <span className="font-bold text-slate-900">{selectedLoadDetails.quantity} {selectedLoadDetails.crop}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Freight:</span>
                <span className="font-bold text-emerald-700 text-sm">{selectedLoadDetails.estimatedCost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Distance:</span>
                <span className="font-semibold">{selectedLoadDetails.estimatedDistance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Required Capacity:</span>
                <span className="font-semibold">{selectedLoadDetails.requiredCapacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pickup Location:</span>
                <span className="font-semibold text-right max-w-[200px]">{selectedLoadDetails.origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="font-semibold text-right max-w-[200px]">{selectedLoadDetails.destination}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                {selectedLoadDetails.details}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLoadDetails(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAcceptLoad(selectedLoadDetails.id);
                  setSelectedLoadDetails(null);
                }}
                disabled={acceptedLoads.includes(selectedLoadDetails.id)}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                {acceptedLoads.includes(selectedLoadDetails.id) ? 'Already Accepted' : 'Accept Load Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST EMPTY RETURN TRIP MODAL */}
      {showAddTripModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handlePublishTrip} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900 font-display">List Empty Return Trip</h3>
            <p className="text-xs text-slate-500">Monetize your empty return route with matched farmgate consignments.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Origin Point</label>
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Destination Point</label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Available Capacity</label>
                  <input
                    type="text"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Departure Time</label>
                  <input
                    type="text"
                    required
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddTripModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Publish Availability
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
