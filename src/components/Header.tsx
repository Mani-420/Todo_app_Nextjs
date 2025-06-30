'use client';

import Link from 'next/link';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="shadow-md border-b px-6 py-4 flex justify-between items-center">
      <Link
        href="/"
        className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
      >
        Todo App
      </Link>

      <div className="flex items-center gap-6">
        <SignedIn>
          <Link
            href="/dashboard/todos"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Dashboard
          </Link>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8'
              }
            }}
          />
        </SignedIn>
        <SignedOut>
          <Link
            href="/sign-in"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign Up
          </Link>
        </SignedOut>
      </div>
    </header>
  );
}
