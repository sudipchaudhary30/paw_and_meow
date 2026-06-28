import '../styles/globals.css';

export const metadata = {
  title: 'PawHome – Pet Adoption & Accessories',
  description: 'Adopt a pet or shop for accessories on PawHome.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
