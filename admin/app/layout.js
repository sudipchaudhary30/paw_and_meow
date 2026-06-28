import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
export const metadata = { title: 'PawHome Admin', description: 'Admin Dashboard' };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}<Toaster position="top-right" /></body>
    </html>
  );
}
