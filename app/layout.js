import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"] });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400"] });

export const metadata = {
  title: "Dead Pipeline Calculator | DFY Workforce",
  description: "Find out how much revenue is sitting untouched in your CRM.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}