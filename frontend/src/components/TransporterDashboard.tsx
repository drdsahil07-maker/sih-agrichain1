import React, { useState } from 'react';
import { Truck, Navigation, Plus, CheckCircle2, Clock, MapPin, DollarSign, ArrowRight } from 'lucide-react';
import { Transporter, BackhaulTrip } from '../../../shared/types';

import { api } from '../services/api';
import { useOrders } from '../hooks/useOrders';
import { OrderStatusTimeline } from './OrderStatusTimeline';

export const TransporterDashboard: React.FC = () => {
  const { orders, refreshOrders } = useOrders();
  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      refreshOrders();
    } catch(e: any) {
      alert("Error updating order status: " + e.message);
    }
  };
  const [transporter] = useState<Transporter>({ id: "tr-1", name: "Jagdish Yadav", phone: "", vehicleNumber: "MP09AB1234", vehicleType: "Tata Ace", totalCapacityKg: 1000, currentLocation: "Indore", currentRoute: "", availableCapacityKg: 500, rating: 4.8, completedTrips: 120, trustScore: 98 }); // Placeholder for authenticated transporter profile // Jagdish Yadav
  const [backhauls, setBackhauls] = useState<BackhaulTrip[]>([]);

  React.useEffect(() => {
    const fetchTrips = async () => {
      const trips = await api.getBackhaulTrips();
      setBackhauls(trips);
    };
    fetchTrips();
  }, []);
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [acceptedLoadId, setAcceptedLoadId] = useState<string | null>(null);

  // New trip form state
  const [origin, setOrigin] = useState('Bhopal Bypass');
  const [destination, setDestination] = useState('Indore City / Sanwer');
  const [availableCapacity, setAvailableCapacity] = useState<number>(500);
  const [departureTime, setDepartureTime] = useState('Today 4:30 PM');

  // Available loads requiring pickup
  const availableLoads = [
    {
      id: 'load-1',
      route: 'Indore → Dewas',
      distance: '35 km',
      weight: '180 kg available',
      pickup: 'Sanwer (Village Cluster A)',
      estimatedEarnings: '₹1,200',
      crop: 'Fresh Tomato Crates',
      pickupTime: 'Today 5:00 PM',
    },
    {
      id: 'load-2',
      route: 'Sanwer → Indore Central Terminal',
      distance: '28 km',
      weight: '500 kg available',
      pickup: 'Kishan Seva Kendra Hub',
      estimatedEarnings: '₹2,100',
      crop: 'Soybean Sacks',
      pickupTime: 'Today 6:30 PM',
    },
    {
      id: 'load-3',
      route: 'Hatod → Dewas Mandi',
      distance: '42 km',
      weight: '320 kg available',
      pickup: 'Hatod Farmgate Point',
      estimatedEarnings: '₹1,650',
      crop: 'Red Onion Mesh Bags',
      pickupTime: 'Tomorrow 7:00 AM',
    },
  ];

  const handleCreateBackhaul = async () => {
    const newTrip = await api.createBackhaulTrip({
      transporterName: transporter.name,
      vehicleType: transporter.vehicleType,
      origin,
      destination,
      availableCapacityKg: availableCapacity,
      departureTime,
    });
    setBackhauls((prev) => [newTrip, ...prev]);
    setShowAddTripModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Available Loads &amp; Transport
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Accept high-paying agricultural pickup loads along your travel route.
          </p>
        </div>

        <button
          id="btn-list-return-trip"
          type="button"
          onClick={() => setShowAddTripModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 text-xs transition-colors cursor-pointer self-start sm:self-center active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ List Empty Return Trip</span>
        </button>
      </div>

      {/* Driver Summary Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{transporter.name}</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                {transporter.vehicleNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {transporter.vehicleType} &bull; Rated capacity: {transporter.totalCapacityKg} kg
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Route Match</span>
            <span className="font-bold text-emerald-700 text-sm">{transporter.efficiencyRating}%</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <span className="text-slate-400 block text-[10px]">Today&apos;s Revenue</span>
            <span className="font-bold text-slate-900 text-sm">₹3,400</span>
          </div>
        </div>
      </div>

      {/* Available Loads Section (Clean, Action-Oriented Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-display">
            Available Loads
          </h2>
          <span className="text-xs text-slate-500">3 loads along your corridor</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {orders.map((order) => (
            <div 
              key={order.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900 font-display">{order.crop}</span>
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                    {order.quantity_kg} kg
                  </span>
                </div>
                <div className="text-sm font-semibold text-emerald-700 font-display">
                  Order ID: {order.id.substring(0,8)}
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Pickup:</span>
                    <span className="font-semibold text-slate-800">{order.pickup_location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Delivery:</span>
                    <span className="font-semibold text-slate-800">{order.delivery_location}</span>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-2 rounded-lg mt-2 overflow-x-auto">
                   <OrderStatusTimeline currentStatus={order.status} />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                {order.status === 'TRANSPORT_ASSIGNED' && (
                  <button onClick={() => handleUpdateStatus(order.id, 'PICKUP_READY')} className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Mark Pickup Ready</button>
                )}
                {order.status === 'PICKUP_READY' && (
                  <button onClick={() => handleUpdateStatus(order.id, 'PICKED_UP')} className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Confirm Picked Up</button>
                )}
                {order.status === 'PICKED_UP' && (
                  <button onClick={() => handleUpdateStatus(order.id, 'IN_TRANSIT')} className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Start Transit</button>
                )}
                {order.status === 'IN_TRANSIT' && (
                  <button onClick={() => handleUpdateStatus(order.id, 'DELIVERED')} className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Mark Delivered</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: List Empty Return Trip */}
      {showAddTripModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 font-display">List Empty Return Trip</h3>
            <p className="text-xs text-slate-500">Pick up farmgate consignments on your return route.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Origin Point</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Available Payload Capacity (kg)</label>
                <input
                  type="number"
                  value={availableCapacity}
                  onChange={(e) => setAvailableCapacity(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Departure Time</label>
                <input
                  type="text"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                />
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
                type="button"
                onClick={handleCreateBackhaul}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Publish Availability
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
