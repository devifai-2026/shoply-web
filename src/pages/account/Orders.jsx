import React, { useEffect, useState } from 'react';
import { ShoppingBag, Package, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { cn } from '../../lib/utils';
import { useAppearance } from '../../context/AppearanceContext';

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('All');
  const { formatPrice } = useAppearance();

  useEffect(() => {
    orderService.getMyOrders()
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    if (tab === 'All')     return true;
    if (tab === 'Active')  return ['pending', 'processing', 'shipped'].includes(o.status);
    if (tab === 'History') return ['delivered', 'cancelled', 'refunded'].includes(o.status);
    return true;
  });

  const statusLabel = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  if (loading) {
    return (
      <div className="bg-white border border-border-minimal animate-pulse">
        <div className="p-10 border-b border-border-minimal h-16" />
        {[1, 2, 3].map(i => <div key={i} className="p-10 border-b border-border-minimal h-32" />)}
      </div>
    );
  }

  return (
    <div className="bg-white border border-border-minimal animate-in fade-in duration-700">
      <div className="flex items-center justify-between p-10 border-b border-border-minimal">
        <h2 className="text-[14px] font-bold text-ink uppercase tracking-[0.2em]">Transaction Registry</h2>
        <div className="flex gap-4">
          {['All', 'Active', 'History'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'text-[11px] font-bold uppercase tracking-widest px-4 py-2 transition-colors',
                t === tab ? 'text-ink bg-surface' : 'text-subtle hover:text-ink'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border-minimal">
        {filtered.map(order => (
          <Link
            key={order._id}
            to={`/account/orders/${order._id}`}
            className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-10 hover:bg-surface transition-colors group"
          >
            <div className="flex items-center gap-10">
              <div className="w-24 h-24 bg-surface border border-border-minimal flex items-center justify-center shrink-0 group-hover:border-ink transition-colors">
                <Package className="w-8 h-8 text-subtle stroke-[1.2]" />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-[14px] font-semibold text-ink uppercase tracking-tight">{order.orderNumber}</span>
                  <span className={cn(
                    'text-[10px] font-bold uppercase tracking-widest px-3 py-1 border border-border-minimal',
                    order.status === 'delivered' ? 'text-subtle' :
                    order.status === 'cancelled' || order.status === 'refunded' ? 'text-subtle opacity-50' :
                    'text-ink border-accent'
                  )}>
                    {statusLabel(order.status)}
                  </span>
                </div>
                <div className="flex gap-6">
                  <p className="text-[11px] text-subtle font-bold uppercase tracking-widest">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-[11px] text-subtle font-bold uppercase tracking-widest">
                    {order.items?.length || 0} Items
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-8 w-full md:w-auto">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-1">Total</p>
                <p className="text-[20px] font-semibold text-ink tracking-tight">{formatPrice(order.total)}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-subtle group-hover:text-ink transition-colors shrink-0 stroke-[1.5]" />
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-24 text-center">
          <ShoppingBag className="w-12 h-12 text-subtle mx-auto mb-10 stroke-[1.2]" />
          <h3 className="text-[18px] font-light text-ink mb-3">No activity recorded</h3>
          <p className="text-subtle text-[13px] mb-12 max-w-xs mx-auto leading-relaxed">
            You haven't placed any orders yet. Your history will appear here.
          </p>
          <Link to="/products" className="btn-minimal inline-block px-12">Explore Catalog</Link>
        </div>
      )}
    </div>
  );
}
