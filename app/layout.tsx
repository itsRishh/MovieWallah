
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { getToken } from "@/lib/auth-server";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getToken();
  return (
    <html lang="en">
      <body className="bg-background text-foreground font-sans min-h-screen">
        <div className="flex flex-col min-h-screen">
          <ConvexClientProvider initialToken={token}>
            <ToastProvider>
              <main className="flex-1 flex flex-col items-center justify-center px-4">
                {children}
              </main>
            </ToastProvider>
          </ConvexClientProvider>
        </div>
      </body>
    </html>
  );
}