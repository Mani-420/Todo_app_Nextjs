import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Todo App
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern, full-stack todo application built with Next.js 15,
            MongoDB, and Clerk authentication. Organize your tasks efficiently
            and stay productive.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {userId ? (
              <Link
                href="/dashboard/todos"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/sign-in"
                  className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                Create Tasks
              </h3>
              <p className="text-gray-600">
                Easily add new todos with a simple and intuitive interface.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                Track Progress
              </h3>
              <p className="text-gray-600">
                Mark tasks as complete and track your productivity over time.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                Stay Organized
              </h3>
              <p className="text-gray-600">
                Edit, delete, and manage your tasks with full CRUD
                functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
