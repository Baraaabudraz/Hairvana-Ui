import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Hairvana Admin Dashboard",
  description: "Admin dashboard for managing Hairvana platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="antialiased">
      <Providers>
        {children}
        <Toaster />
      </Providers>
    </div>
  );
}