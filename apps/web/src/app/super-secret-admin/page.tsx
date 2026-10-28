import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSession } from '../../lib/session';
import AdminLoginForm from './AdminLoginForm';

export default async function AdminLoginPage() {
  const authCookie = cookies().get('admin_auth');
  const sessionUser = await getServerSession();

  if (authCookie?.value === 'authenticated' || sessionUser?.role === 'ADMIN') {
    // If authenticated via admin session or cookie, immediately go to dashboard
    redirect('/super-secret-admin/dashboard');
  }

  return <AdminLoginForm />;
}
