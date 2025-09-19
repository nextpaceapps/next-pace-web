"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header role="banner" className="w-full border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-bold tracking-wide">
          NEXT PACE
        </Link>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </header>
  );
}


