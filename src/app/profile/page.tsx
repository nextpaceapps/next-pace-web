"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSession, clearSession } from "@/lib/session.mock";
import { getGarminStatus, connectGarmin, disconnectGarmin } from "@/lib/garmin.mock";

export default function ProfilePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [sessionExists, setSessionExists] = useState(false);
  const [status, setStatus] = useState(getGarminStatus());

  useEffect(() => {
    const s = getSession();
    if (!s) {
      setSessionExists(false);
      router.replace("/login");
      return;
    }
    setSessionExists(true);
    setChecking(false);
  }, [router]);

  function simulateConnect(result: 'authorize' | 'deny' | 'cancel' | 'error') {
    setStatus({ status: 'CONNECTING' });
    window.setTimeout(() => {
      const newState = connectGarmin(result);
      setStatus(newState);
    }, 500);
  }

  if (checking) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center p-6">
        <p className="text-sm text-gray-500">Checking session…</p>
      </main>
    );
  }

  if (!sessionExists) return null;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Your Profile</h1>
        <p className="mt-2 text-sm text-gray-500">Manage your account and connections.</p>
      </header>

      <section aria-labelledby="connect-heading" className="rounded-lg border p-4">
        <h2 id="connect-heading" className="text-lg font-medium">Connect</h2>
        <p className="mt-1 text-sm text-gray-500">
          Link your Garmin account to share activity and wellness data. You’ll be redirected to Garmin to review and authorize sharing. You can deny or disconnect anytime.
        </p>

        <div className="mt-4" aria-live="polite" role="status">
          {status.status === 'NOT_CONNECTED' && (
            <div className="grid gap-3">
              <Button onClick={() => simulateConnect('authorize')}>Connect Garmin (authorize)</Button>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => simulateConnect('deny')}>Sim Deny</Button>
                <Button variant="outline" onClick={() => simulateConnect('cancel')}>Sim Cancel</Button>
                <Button variant="destructive" onClick={() => simulateConnect('error')}>Sim Error</Button>
              </div>
            </div>
          )}

          {status.status === 'CONNECTING' && (
            <p className="text-sm text-gray-500">Connecting…</p>
          )}

          {status.status === 'CONNECTED' && (
            <div className="flex items-center gap-3">
              <p className="text-sm">Garmin connected.</p>
              <Button variant="outline" onClick={() => setStatus(disconnectGarmin())}>Disconnect</Button>
            </div>
          )}

          {status.status === 'ERROR' && (
            <div className="grid gap-2">
              <p className="text-sm text-red-600">{status.message ?? 'Connection error (mocked).'} </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => simulateConnect('authorize')}>Retry Connect</Button>
                <Button variant="destructive" onClick={() => setStatus(disconnectGarmin())}>Reset</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mt-8">
        <Button variant="ghost" onClick={() => { clearSession(); router.push('/login'); }}>Logout</Button>
      </div>
    </main>
  );
}
