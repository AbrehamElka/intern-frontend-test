// app/dashboard/layout.tsx
'use client';

import Link from 'next/link';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter(); // Initialize useRouter

  // Helper function to determine if a link is active
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { // Call your new logout API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Redirect to the sign-in page after successful logout
        router.push('/auth/signin');
      } else {
        // Handle error (e.g., display a toast or log)
        const errorData = await response.json();
        console.error('Logout failed:', errorData.message || 'Unknown error');
        // Optionally, redirect anyway if logout "failed" but cookie might be gone
        router.push('/auth/signin');
      }
    } catch (error) {
      console.error('Network error during logout:', error);
      // Even on network error, try to redirect as the cookie might be invalid/gone anyway
      router.push('/auth/signin');
    }
  };

  return (
    <>
      {/* Full-width Header for Authenticated Pages */}
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center w-full">
        <Link href="/dashboard/posts">
          <h1 className="text-2xl font-semibold text-gray-800 cursor-pointer">Post Management</h1>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link
            href="/dashboard/posts"
            className={`text-gray-600 hover:text-purple-600 ${
              isActive('/dashboard/posts') && !isActive('/dashboard/myposts') ? 'font-bold text-purple-600' : ''
            }`}
          >
            All Posts
          </Link>
          <Link
            href="/dashboard/myposts"
            className={`text-gray-600 hover:text-purple-600 ${
              isActive('/dashboard/myposts') ? 'font-bold text-purple-600' : ''
            }`}
          >
            My Posts
          </Link>
          <Link
            href="/dashboard/myposts/create-post"
            className={`text-gray-600 hover:text-purple-600 ${
              isActive('/dashboard/myposts/create-post') ? 'font-bold text-purple-600' : ''
            }`}
          >
            Create Post
          </Link>
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Main content area for authenticated pages */}
      <main className="flex flex-col items-center bg-gray-100 min-h-[calc(100vh-64px)] py-8">
        <div className="w-full max-w-5xl px-4">
          {children}
        </div>
      </main>
    </>
  );
}