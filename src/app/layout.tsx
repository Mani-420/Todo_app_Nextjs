import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'Full Stack Todo App with Next.js 15, MongoDB, and Clerk'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="container mx-auto px-4">
            <header className="py-4">
              <h1 className="text-3xl font-bold">Todo App</h1>
            </header>
          </div>
          <main className="my-8">
            <div className="shadow-md rounded-lg p-6">{children}</div>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
