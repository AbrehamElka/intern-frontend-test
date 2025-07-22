// app/auth/layout.tsx
import Link from "next/link";
import React from "react"; // Make sure React is imported

export default function AuthLayoutSegment({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Full-width Header for Auth Pages - THIS REMAINS HERE */}
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center w-full">
        <Link href="/">
          {" "}
          {/* This link can go to the app's root */}
          <h1 className="text-2xl font-semibold text-gray-800 cursor-pointer">
            Post Management
          </h1>
        </Link>
        <div>
          {/* Note: Links updated to include /auth/ prefix */}
          <Link
            href="/auth/signin"
            className="text-gray-600 hover:text-purple-600 mr-4"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main content area for auth forms */}
      {/* This main tag is responsible for the full screen height and centering its children */}
      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-100">
        {children}{" "}
        {/* This will render the actual sign-in/sign-up page content */}
      </main>
    </>
  );
}
