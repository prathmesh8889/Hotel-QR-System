import { OrderStatus, TableStatus } from '../../types';

const orderStatusConfig: Record<OrderStatus, { label: string; className: string; dot: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  preparing: { label: 'Preparing', className: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  ready: { label: 'Ready', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  served: { label: 'Served', className: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  paid: { label: 'Paid', className: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
};

const tableStatusConfig: Record<TableStatus, { label: string; className: string; dot: string }> = {
  available: { label: 'Available', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  occupied: { label: 'Occupied', className: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  dirty: { label: 'Needs Cleaning', className: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  reserved: { label: 'Reserved', className: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
};

export function OrderStatusBadge({ status, size = 'sm' }: { status: OrderStatus; size?: 'sm' | 'md' }) {
  const config = orderStatusConfig[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.className} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function TableStatusBadge({ status, size = 'sm' }: { status: TableStatus; size?: 'sm' | 'md' }) {
  const config = tableStatusConfig[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.className} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function KitchenStatusBadge({ status, elapsed }: { status: OrderStatus; elapsed: number }) {
  const isDelayed = status === 'pending' && elapsed > 15;
  const config = isDelayed
    ? { label: 'DELAYED', className: 'bg-red-500 text-white', dot: 'bg-white' }
    : orderStatusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold px-3 py-1 text-sm ${config.className}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
    </span>
  );
}
