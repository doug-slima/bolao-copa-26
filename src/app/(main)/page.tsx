import { auth } from "@clerk/nextjs/server";
import { LandingPage, LoggedHome } from "@/components/bolao";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    return <LoggedHome />;
  }

  return <LandingPage />;
}
