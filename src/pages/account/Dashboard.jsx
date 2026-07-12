import React, { useEffect, useState } from 'react';
import { ShoppingBag, Heart, Box } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppearance } from '../../context/AppearanceContext';
import { orderService } from '../../services/orderService';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user }            = useAuth();
  const { formatPrice }     = useAppearance();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    orderService.getMyOrders({ limit: 5 })
      .then(r => setOrders(r.data))
      .catch(() => {});
  }, []);

  const stats = [
    { label: 'Purchases',  value: String(user?.orderCount ?? 0).padStart(2, '0'),  icon: ShoppingBag },
    { label: 'Total Spent', value: formatPrice(user?.totalSpent ?? 0, 0),           icon: Box },
  ];

  return (
    <div className="space-y-20 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface p-10 border border-border-minimal flex flex-col items-start gap-4">
            <div className="w-10 h-10 bg-surface border border-border-minimal flex items-center justify-center text-ink p-2">
              <stat.icon className="w-full h-full stroke-[1.5]" />
            </div>
            <div>
              <span className="text-[10px] font-normal text-subtle uppercase tracking-[0.011em] block mb-2">{stat.label}</span>
              <span className="text-[32px] font-normal text-ink tracking-tight">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border-minimal">
        <div className="p-8 border-b border-border-minimal">
          <h3 className="text-[14px] font-normal text-ink uppercase tracking-[0.011em]">Recent Orders</h3>
        </div>
        <div className="divide-y divide-border-minimal">
          {orders.length === 0 ? (
            <div className="p-10 text-center text-subtle text-[13px]">No orders yet.</div>
          ) : (
            orders.map(order => (
              <div key={order._id} className="flex flex-col sm:flex-row items-center justify-between p-8 gap-6 hover:bg-bg transition-colors">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-bg border border-border-minimal overflow-hidden shrink-0 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-subtle stroke-[1.2]" />
                  </div>
                  <div>
                    <p className="font-medium text-ink text-[14px] leading-tight mb-2 uppercase tracking-tight">{order.orderNumber}</p>
                    <p className="text-[11px] text-subtle font-normal uppercase tracking-[0.011em]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-12 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="sm:text-right">
                    <p className="text-[16px] font-medium text-ink mb-1 tracking-tight">{formatPrice(order.total)}</p>
                    <p className="text-[10px] text-subtle font-normal uppercase tracking-[0.011em] border border-border-minimal px-3 py-1 inline-block capitalize">{order.status}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-6 text-center border-t border-border-minimal bg-bg">
          <Link to="/account/orders" className="text-[11px] font-normal text-subtle uppercase tracking-[0.011em] hover:text-ink transition-colors">
            Review All History
          </Link>
        </div>
      </div>
    </div>
  );
}
