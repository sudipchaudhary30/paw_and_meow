import { Toaster } from 'react-hot-toast';
export const metadata = { title: 'PawHome Admin', description: 'Admin Dashboard' };
export default function AdminLayout({ children }) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}
