// app/dashboard/page.tsx
"use client"; // Ensure this is present for client-side components

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "../../components/LogoutButton"; // Adjust path if necessary

const DashboardPage = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null); // Example: to display user's email

  useEffect(() => {
    // This is a client-side check. The main protection is the middleware.
    // However, you might fetch user details or a profile here.
    // For now, let's simulate fetching user info from a protected API route if needed.
    const fetchUserProfile = async () => {
      // Example of fetching user profile from a protected backend route
      // Make sure your backend has a /auth/profile or /users/me endpoint protected by JwtAuthGuard
      const nestJsApiUrl = process.env.NEXT_PUBLIC_NESTJS_API_URL;
      if (!nestJsApiUrl) {
        console.error("NEXT_PUBLIC_NESTJS_API_URL is not defined.");
        router.push("/auth/signin"); // Redirect if API URL is missing
        return;
      }

      try {
        const response = await fetch(`${nestJsApiUrl}/users/profile`, {
          // Assuming a /users/profile endpoint
          method: "GET",
          credentials: "include", // Important for sending the http-only cookie
        });

        if (response.ok) {
          const userData = await response.json();
          setUserEmail(userData.email); // Assuming the response has an email field
        } else if (response.status === 401) {
          // If the token is expired or invalid (e.g., manually cleared), redirect
          console.log(
            "Unauthorized access to dashboard, redirecting to signin."
          );
          router.push("/auth/signin");
        } else {
          // Handle other errors
          console.error("Failed to fetch user profile:", response.statusText);
          router.push("/auth/signin"); // Redirect on general error
        }
      } catch (error) {
        console.error("Network error fetching profile:", error);
        router.push("/auth/signin"); // Redirect on network error
      }
    };

    fetchUserProfile();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl text-center text-gray-800">
        <h1 className="text-4xl font-extrabold mb-4">
          Welcome to Your Dashboard!
        </h1>
        {userEmail ? (
          <p className="text-lg mb-6">
            Hello,{" "}
            <span className="font-semibold text-purple-600">{userEmail}</span>!
          </p>
        ) : (
          <p className="text-lg mb-6">Loading user data...</p>
        )}
        <p className="text-md mb-8">
          This is your protected area, accessible only after successful
          authentication.
        </p>
        <LogoutButton /> {/* Add your logout button here */}
      </div>
    </div>
  );
};

export default DashboardPage;
