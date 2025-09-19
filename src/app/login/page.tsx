"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setSession } from "@/lib/session.mock";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function handleGoogleSuccess() {
    setIsLoading(true);
    setMessage("");
    // Mock creating a session
    setSession({
      userId: "user_mock_1",
      displayName: "Next Pace User",
      email: "user@example.com",
    });
    router.push("/profile");
  }

  function handleGoogleCancel() {
    setIsLoading(false);
    setMessage("Sign-in was canceled. Please try again.");
  }

  function handleGoogleError() {
    setIsLoading(false);
    setMessage("We couldn’t complete Google sign-in (mocked). Please retry.");
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="mt-2 text-sm text-gray-500">
          Use the mocked Google sign-in to continue.
        </p>

        <div className="mt-6 grid gap-3">
          <Button
            onClick={handleGoogleSuccess}
            disabled={isLoading}
            className="w-full"
          >
            Continue with Google (mock)
          </Button>
          <Button
            variant="outline"
            onClick={handleGoogleCancel}
            disabled={isLoading}
            className="w-full"
          >
            Simulate Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleGoogleError}
            disabled={isLoading}
            className="w-full"
          >
            Simulate Error
          </Button>
        </div>

        <p
          className="mt-4 text-sm text-red-600 min-h-5"
          aria-live="polite"
          role="status"
        >
          {message}
        </p>
      </div>
    </main>
  );
}


