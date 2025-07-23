import { Montserrat } from 'next/font/google';

// Define the Montserrat font with appropriate weights
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-montserrat',
});
