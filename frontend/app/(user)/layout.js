import '../../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'PawHome – Pet Adoption & Accessories',
  description: 'Adopt a pet or shop for accessories on PawHome.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-slate-800">
        <Navbar />
        <main className="min-h-screen w-full overflow-x-hidden">{children}</main>
        <Footer />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
