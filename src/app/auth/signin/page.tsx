// app/auth/signin/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const nestJsApiUrl = process.env.NEXT_PUBLIC_NESTJS_API_URL;

      if (!nestJsApiUrl) {
        throw new Error(
          "NEXT_PUBLIC_NESTJS_API_URL is not defined. Check your .env.local file."
        );
      }

      const response = await fetch(`${nestJsApiUrl}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message && Array.isArray(errorData.message)) {
          setError(errorData.message.join(", "));
        } else if (errorData.message) {
          setError(errorData.message);
        } else {
          setError("An unexpected error occurred during sign in.");
        }
        return;
      }

      const data = await response.json();
      console.log("Sign-in successful (cookie set by backend):", data);

      alert("Signed in successfully!");
      router.push("/dashboard/posts");
    } catch (err: any) {
      console.error("Network or unexpected error:", err);
      setError(
        err.message || "Failed to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // REMOVED THE OUTER DIV. The layout handles the full screen and centering.
    // The classes below are now for the card itself.
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
      {" "}
      {/* This is your card. max-w-2xl makes it quite wide. */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your account</p>
      </div>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Link
            href="#"
            className="text-sm text-purple-600 hover:underline mt-1 block"
          >
            Forgot password?
          </Link>
        </div>

        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label
            htmlFor="rememberMe"
            className="ml-2 block text-sm text-gray-900"
          >
            Remember me
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
      <p className="text-center text-gray-600 text-sm mt-6">
        Don't have an account?{" "}
        <Link href="/auth/signup" className="text-purple-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
