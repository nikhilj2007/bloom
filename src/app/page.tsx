import { auth } from "@clerk/nextjs/server";
import { LandingPage } from "@/components/LandingPage";
import { Dashboard } from "@/components/Dashboard";

// Server component — no "use client" needed.
// auth() runs on the server so there is no flash of unauthenticated content.
export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div suppressHydrationWarning>
        <LandingPage />
      </div>
    );
  }

  return (
    <div suppressHydrationWarning>
      <Dashboard />
    </div>
  );
}
