// components/PostEditForm.tsx
"use client"; // This is a Client Component

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Assuming you have this button component

// Define a type for your Post (matching your backend/Prisma schema)
interface Post {
  id: number;
  title: string;
  description: string;
  authorId: number;
  author: {
    id: number;
    email: string;
    name?: string;
  };
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

interface PostEditFormProps {
  initialPost: Post;
}

export const PostEditForm: React.FC<PostEditFormProps> = ({ initialPost }) => {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost.title);
  const [description, setDescription] = useState(initialPost.description || ""); // Handle potential null/undefined description
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const nestJsApiUrl = process.env.NEXT_PUBLIC_NESTJS_API_URL;

    if (!nestJsApiUrl) {
      setError("API URL is not defined in environment variables.");
      setLoading(false);
      return;
    }

    if (!title.trim()) {
      setError("Post title cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${nestJsApiUrl}/posts/${initialPost.id}`, {
        method: "PATCH", // Use PATCH for updating
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Crucial for sending the HTTP-only cookie
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        setSuccess("Post updated successfully!");
        // Optionally redirect to the updated post's view page or myposts list
        setTimeout(() => {
          router.push(`/dashboard/myposts/${initialPost.id}`); // Redirect to view page
        }, 1500);
      } else if (response.status === 401 || response.status === 403) {
        console.error(
          "Authentication error updating post. Redirecting to sign-in."
        );
        router.push("/auth/signin");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update post.");
      }
    } catch (err: any) {
      console.error("Error updating post:", err);
      setError(
        err.message || "An unexpected error occurred during post update."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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
          rows={7}
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
        {loading ? "Saving Changes..." : "Save Changes"}
      </Button>
    </form>
  );
};
