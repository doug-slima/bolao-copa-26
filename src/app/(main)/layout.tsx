import { Header, FabActions } from "@/components/bolao";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 pb-24">
        {children}
      </main>
      <FabActions />
    </div>
  );
}
