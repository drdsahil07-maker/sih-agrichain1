const fs = require('fs');
const file = 'frontend/src/components/FarmerDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { useOrders }")) {
  content = content.replace("import { api } from '../services/api';", "import { api } from '../services/api';\nimport { useOrders } from '../hooks/useOrders';\nimport { OrderStatusTimeline } from './OrderStatusTimeline';\nimport { Package } from 'lucide-react';");
}

if (!content.includes("const { orders } = useOrders();")) {
  content = content.replace("const benchmark: PriceBenchmark = benchmarks[selectedCrop] || SEED_PRICE_BENCHMARKS['Tomato'];", "const benchmark: PriceBenchmark = benchmarks[selectedCrop] || SEED_PRICE_BENCHMARKS['Tomato'];\n  const { orders } = useOrders();");
}

const ordersSection = `
      {/* Active Orders Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900 font-display">Active Orders for Your Pools</h2>
        </div>
        {orders.length === 0 ? (
          <div className="text-sm text-slate-500 py-4 text-center">No active orders found for your pools.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900">{order.crop}</span>
                  <span className="font-semibold text-emerald-700">{order.quantity_kg} kg</span>
                </div>
                <div className="text-xs text-slate-600 mb-4">₹{order.agreed_price_per_kg}/kg - Est. Net: ₹{order.farmer_net_value}</div>
                <div className="bg-slate-50 p-3 rounded-lg overflow-x-auto">
                   <OrderStatusTimeline currentStatus={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};`;

content = content.replace(/    <\/div>\s*  \);\s*};\s*$/, ordersSection);

fs.writeFileSync(file, content);
console.log('Patched FarmerDashboard');
