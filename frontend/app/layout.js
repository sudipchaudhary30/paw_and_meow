import '../styles/globals.css';

export const metadata = {
  title: 'PawHome – Pet Adoption & Accessories',
  description: 'Adopt a pet or shop for accessories on PawHome.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-slate-800">
        {children}
      </body>
    </html>
  );
}
