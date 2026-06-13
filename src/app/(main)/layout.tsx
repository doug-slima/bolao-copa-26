import { Header, FabActions, NotificationToast } from "@/components/bolao";
import { UserSync } from "@/components/auth/user-sync";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <UserSync />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 pb-24">
        {children}
      </main>
      <FabActions />
      <NotificationToast />
    </div>
  );
}
