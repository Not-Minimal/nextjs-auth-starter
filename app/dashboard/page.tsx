"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { signOut, useTypedSession } from "@/lib/auth-client";

export default function DashboardPage() {
  const { data: session, isPending } = useTypedSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Stories of Software</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {session.user.name}!
          </h2>
          <p className="text-muted-foreground">
            You&apos;re successfully authenticated with better-auth
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Info Card */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Your Profile</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{" "}
                <span className="font-medium">{session.user.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                <span className="font-medium">{session.user.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span>{" "}
                <span className="font-medium capitalize">
                  {session.user.role.toLowerCase()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Locale:</span>{" "}
                <span className="font-medium uppercase">
                  {session.user.locale}
                </span>
              </div>
            </div>
          </div>

          {/* Session Info Card */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Session Info</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Session ID:</span>{" "}
                <span className="font-mono text-xs">
                  {session.session.id.slice(0, 16)}...
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Expires:</span>{" "}
                <span className="font-medium">
                  {new Date(session.session.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Create Post
              </Button>
              <Button variant="outline" className="w-full justify-start">
                View Posts
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Debug Info (remove in production) */}
        <div className="mt-8 rounded-lg border bg-muted p-6">
          <h3 className="font-semibold mb-4">Debug Info</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}
