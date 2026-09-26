const fs = require('fs');
const file = 'frontend/src/components/TransporterDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// The replacement UI for Orders
const ordersUI = `
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
`;

const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('{availableLoads.map((load) => ('));
const end = lines.findIndex((l, i) => i > start && l.includes('</>')) + 7;

if (start !== -1 && end > start) {
  lines.splice(start, end - start, ordersUI);
  fs.writeFileSync(file, lines.join('\n'));
  console.log('Patched!');
} else {
  console.log('Not found.');
}
