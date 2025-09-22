"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Image from "next/image";

export function Header() {
  const { data: session } = useSession();
  return (
    <header role="banner" className="w-full border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-bold tracking-wide">
          NEXT PACE
        </Link>
        {session?.user ? (
          <Link href="/profile" className="inline-flex items-center gap-2">
            {session.user.image ? (
              <Image src={session.user.image} alt="Avatar" width={32} height={32} className="rounded-full" />
            ) : null}
            <span className="text-sm">Profile</span>
          </Link>
        ) : (
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
}


