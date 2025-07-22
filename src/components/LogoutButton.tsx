// components/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setError(null);
    setLoading(true);

    try {
      const nestJsApiUrl = process.env.NEXT_PUBLIC_NESTJS_API_URL;

      if (!nestJsApiUrl) {
        throw new Error("NEXT_PUBLIC_NESTJS_API_URL is not defined.");
      }

      const response = await fetch(`${nestJsApiUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Crucial for sending/receiving cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to logout.");
        return;
      }

      // --- CRITICAL CHANGE FOR LOGOUT ---
      // Instead of router.push and router.refresh, trigger a full page reload.
      // This forces Next.js to re-evaluate everything, including middleware.
      window.location.href = "/auth/signin"; // Forces a full redirect
      // Or, if you want to stay on the same page but force a full re-render (less common for logout):
      // window.location.reload(); // Reloads the current page, which will then trigger middleware for the current URL
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message || "An error occurred during logout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        onClick={handleLogout}
        disabled={loading}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Logging Out..." : "Logout"}
      </button>
    </div>
  );
}
