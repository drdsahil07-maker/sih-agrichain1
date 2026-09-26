const fs = require('fs');
const file = 'frontend/src/components/AdminCommandCenter.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { useOrders }")) {
  content = content.replace("import { supabase, checkSupabaseConnection } from '../lib/supabase';", "import { supabase, checkSupabaseConnection } from '../lib/supabase';\nimport { useOrders } from '../hooks/useOrders';\nimport { OrderStatusTimeline } from './OrderStatusTimeline';\nimport { Package } from 'lucide-react';");
}

if (!content.includes("const { orders } = useOrders();")) {
  content = content.replace("const [isLoading, setIsLoading] = useState(false);", "const [isLoading, setIsLoading] = useState(false);\n  const { orders } = useOrders();");
}

const ordersSection = `
      {/* System Orders Oversight */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Active Orders (System Oversight)
        </h3>
        {orders.length === 0 ? (
          <div className="text-sm text-slate-500 py-4 text-center">No active orders in system.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold text-slate-900">{order.crop} - {order.quantity_kg}kg</div>
                    <div className="text-xs text-slate-500">ID: {order.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-700">₹{order.total_amount}</div>
                    <div className="text-xs text-slate-500">Net: ₹{order.farmer_net_value}</div>
                  </div>
                </div>
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
console.log('Patched AdminCommandCenter');
