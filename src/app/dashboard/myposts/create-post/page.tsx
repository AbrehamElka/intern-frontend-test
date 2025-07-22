// app/dashboard/myposts/create-post/page.tsx
"use client"; // This page needs to be a Client Component for form handling

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // For the back button
import { Button } from "@/components/ui/button"; // Assuming you have this button component

// IMPORTANT: This ensures the page is always rendered dynamically on the server
// before hydration, and prevents Next.js from caching a static version of this protected page.
export const dynamic = "force-dynamic";

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setError(null);
    setSuccess(null);
    setLoading(true);

    const nestJsApiUrl = process.env.NEXT_PUBLIC_NESTJS_API_URL;

    if (!nestJsApiUrl) {
      setError("API URL is not defined in environment variables.");
      setLoading(false);
      return;
    }

    // Basic validation
    if (!title.trim()) {
      setError("Post title cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${nestJsApiUrl}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Crucial for sending the HTTP-only cookie
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        setSuccess("Post created successfully!");
        // Optionally clear the form
        setTitle("");
        setDescription("");
        // Redirect to 'My Posts' page after a short delay or immediately
        setTimeout(() => {
          router.push("/dashboard/myposts");
        }, 1500); // Give user a moment to see success message
      } else if (response.status === 401 || response.status === 403) {
        // Unauthorized or Forbidden - redirect to login
        console.error(
          "Authentication error creating post. Redirecting to sign-in."
        );
        router.push("/auth/signin");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create post.");
      }
    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(
        err.message || "An unexpected error occurred during post creation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 px-4 py-8 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Create New Post</h1>
          <Link href="/dashboard/myposts">
            <Button variant="outline" className="border-gray-300">
              Back to My Posts
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Enter post title"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm resize-y"
              placeholder="Write your post content here..."
            ></textarea>
          </div>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Creating Post..." : "Create Post"}
          </Button>
        </form>
      </div>
    </main>
  );
}
