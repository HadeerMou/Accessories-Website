import type { Metadata } from 'next';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Aura',
  description: 'Manage Aura orders, products, inventory, and customers.',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
