import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapPin {
  id: string;
  name: string;
  type: 'farmer' | 'pool' | 'transporter' | 'buyer' | 'mandi';
  lat: number;
  lng: number;
  description: string;
  quantity?: number;
}

const PINS: MapPin[] = [
  { id: '1', name: 'Ramesh Patel (Farmgate)', type: 'farmer', lat: 22.9784, lng: 75.8285, description: '100 kg Tomatoes, Grade A', quantity: 100 },
  { id: '2', name: 'Suresh Verma', type: 'farmer', lat: 22.9621, lng: 75.9812, description: '120 kg Tomatoes, Grade A', quantity: 120 },
  { id: '3', name: 'Mukesh Choudhary', type: 'farmer', lat: 22.8124, lng: 75.9012, description: '60 kg Tomatoes', quantity: 60 },
  { id: '4', name: 'Virtual Consignment #AC-1024', type: 'pool', lat: 22.9200, lng: 75.8800, description: 'Aggregated 510 kg Tomato Consignment', quantity: 510 },
  { id: '5', name: 'Jagdish Yadav (Tata Ace Backhaul)', type: 'transporter', lat: 22.8950, lng: 76.0100, description: 'Returning Bhopal→Indore, 500 kg available capacity' },
  { id: '6', name: 'Shreemaya Hotel & Restaurants', type: 'buyer', lat: 22.7196, lng: 75.8577, description: 'Procuring 500 kg Grade A Tomatoes @ ₹18/kg' },
  { id: '7', name: 'Choithram Mandi (Indore APMC)', type: 'mandi', lat: 22.6880, lng: 75.8450, description: 'Traditional mandi benchmark: ₹10.50 - ₹12.50' },
  { id: '8', name: 'Dewas Kisan FPO Hub', type: 'pool', lat: 22.9676, lng: 76.0534, description: 'FPO Collective Staging & Grading Facility' },
];

export const AgriMap: React.FC<{ height?: string; highlightPool?: boolean }> = ({ height = '450px', highlightPool = false }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered around Indore / Sanwer / Dewas corridor
    const map = L.map(mapContainerRef.current).setView([22.84, 75.92], 10);
    mapInstanceRef.current = map;

    // OpenStreetMap free tile layer (no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors | AgriChain Spatial Layer',
    }).addTo(map);

    // Color-coded marker icons
    const createIcon = (color: string, label: string) => {
      return L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="
            background: ${color}; 
            color: white; 
            border-radius: 9999px; 
            padding: 4px 8px; 
            font-size: 11px; 
            font-weight: 700; 
            display: flex; 
            align-items: center; 
            gap: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            border: 2px solid #ffffff;
            white-space: nowrap;
          ">
            <span>${label}</span>
          </div>
        `,
        iconSize: [80, 26],
        iconAnchor: [40, 13],
      });
    };

    // Add pins to map
    PINS.forEach((pin) => {
      let color = '#10b981'; // Green for farmers
      let badge = '👨‍🌾 Farmer';
      if (pin.type === 'pool') {
        color = '#8b5cf6'; // Purple for pools
        badge = '📦 Pool #1024';
      } else if (pin.type === 'transporter') {
        color = '#3b82f6'; // Blue for transport
        badge = '🚚 Return Truck';
      } else if (pin.type === 'buyer') {
        color = '#f59e0b'; // Amber for buyers
        badge = '🍽️ Buyer';
      } else if (pin.type === 'mandi') {
        color = '#64748b'; // Gray for mandi
        badge = '🏛️ Mandi';
      }

      const marker = L.marker([pin.lat, pin.lng], {
        icon: createIcon(color, badge),
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
          <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: bold; color: #0f172a;">${pin.name}</h4>
          <p style="margin: 0 0 6px; font-size: 12px; color: #475569;">${pin.description}</p>
          <span style="display: inline-block; background: ${color}20; color: ${color}; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px;">
            ${pin.type.toUpperCase()}
          </span>
        </div>
      `);
    });

    // Draw route lines connecting Pool to Transporter to Buyer
    const routePoints: L.LatLngExpression[] = [
      [22.9784, 75.8285], // Sanwer farmgate
      [22.9200, 75.8800], // Pool aggregation center
      [22.8950, 76.0100], // Backhaul truck intercept
      [22.7196, 75.8577], // Shreemaya Buyer
    ];

    const polyline = L.polyline(routePoints, {
      color: '#10b981',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.85,
    }).addTo(map);

    polyline.bindTooltip('Compiled Optimal Route B (Farmgate → Cluster A Aggregator → Return Tata Ace → Shreemaya)', {
      sticky: true,
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [highlightPool]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0 isolate">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs flex items-center gap-3 pointer-events-auto">
        <span className="flex items-center gap-1 text-slate-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Farmer
        </span>
        <span className="flex items-center gap-1 text-slate-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Virtual Pool
        </span>
        <span className="flex items-center gap-1 text-slate-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Return Truck
        </span>
        <span className="flex items-center gap-1 text-slate-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Buyer
        </span>
      </div>
    </div>
  );
};
