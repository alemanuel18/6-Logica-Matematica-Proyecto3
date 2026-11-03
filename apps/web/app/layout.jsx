import './globals.css';

export const metadata = {
  title: 'Evaluador semántico',
  description: 'Evaluador de lógica de primer orden sobre interpretaciones finitas.'
};

export default function RootLayout({ children }) {
  return <html lang="es"><body>{children}</body></html>;
}
