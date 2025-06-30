'use client';

import Link from 'next/link';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="bg-white shadow px-4 py-3 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-blue-600">
        Todo App
      </Link>

      <div className="flex items-center gap-4">
        <SignedIn>
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Dashboard
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in" className="text-blue-500 hover:underline">
            Sign In
          </Link>
          <Link href="/sign-up" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </SignedOut>
      </div>
    </header>
  );
}
