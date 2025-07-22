// app/dashboard/myposts/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react"; // Add useCallback
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ConfirmModal"; // Import the new modal component

export const dynamic = "force-dynamic";

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
  createdAt: string;
  updatedAt: string;
}

// Pass a handleDelete function from the parent
interface PostCardProps {
  post: Post;
  onDeleteClick: (postId: number) => void; // Callback for when delete button is clicked
}

const PostCard: React.FC<PostCardProps> = ({ post, onDeleteClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {post.description}
        </p>
      </div>
      <div className="flex justify-between items-center text-xs text-gray-500 mt-4">
        <span>{post.author.name || post.author.email}</span>
        <span>{formatDate(post.createdAt)}</span>
      </div>
      <div className="flex gap-2 mt-4">
        <Link href={`/dashboard/myposts/${post.id}`}>
          <Button variant="outline" className="border-gray-300">
            View
          </Button>
        </Link>
        <Link href={`/dashboard/myposts/${post.id}/edit`}>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Edit
          </Button>
        </Link>
        {/* --- MODIFIED DELETE BUTTON --- */}
        <Button
          onClick={() => onDeleteClick(post.id)} // Trigger modal open in parent
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Delete
        </Button>
        {/* --- END MODIFIED DELETE BUTTON --- */}
      </div>
    </div>
  );
};

export default function MyPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // State for delete operation loading

  // Function to refetch posts (useful after delete)
  const fetchMyPosts = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    const nestJsApiUrl = process.env.NEXT_PUBLIC_NESTJS_API_URL;

    if (!nestJsApiUrl) {
      setError("API URL is not defined.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${nestJsApiUrl}/posts/my`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data: Post[] = await response.json();
        setPosts(data);
      } else if (response.status === 401 || response.status === 403) {
        console.error(
          "Authentication error fetching posts. Redirecting to sign-in."
        );
        router.push("/auth/signin");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch posts.");
      }
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [router]); // Include router in useCallback dependencies

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]); // Depend on fetchMyPosts

  // Handler to open the confirmation modal
  const handleOpenDeleteModal = (postId: number) => {
    setPostToDelete(postId);
    setIsModalOpen(true);
  };

  // Handler to close the confirmation modal
  const handleCloseDeleteModal = () => {
    setIsModalOpen(false);
    setPostToDelete(null); // Clear post to delete
    setError(null); // Clear any modal-related errors
  };

  // Handler for confirmed deletion
  const handleConfirmDelete = async () => {
    if (postToDelete === null) return;

    setIsDeleting(true); // Set deleting state for the button
    setError(null); // Clear previous errors before new attempt

    const nestJsApiUrl = process.env.NEXT_PUBLIC_NESTJS_API_URL;

    try {
      const response = await fetch(`${nestJsApiUrl}/posts/${postToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        // If deletion is successful, update the posts list by filtering out the deleted one
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post.id !== postToDelete)
        );
        handleCloseDeleteModal(); // Close modal on success
      } else if (response.status === 401 || response.status === 403) {
        console.error(
          "Authorization error deleting post. Redirecting to sign-in."
        );
        router.push("/auth/signin");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete post.");
      }
    } catch (err: any) {
      console.error("Error deleting post:", err);
      setError(err.message || "An unexpected error occurred during deletion.");
    } finally {
      setIsDeleting(false); // Reset deleting state
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
        <p className="text-lg text-gray-700">Loading your posts...</p>
      </main>
    );
  }

  if (error && !isModalOpen) {
    // Display page-level error if modal is not open
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
        <p className="text-lg text-red-500">Error: {error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Your Posts</h1>
        <Link href="/dashboard/myposts/create-post">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md">
            + New Post
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">
            You haven't created any posts yet.
          </p>
          <Link href="/dashboard/myposts/create-post">
            <Button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md">
              Create Your First Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDeleteClick={handleOpenDeleteModal}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={
          error // Display API error message inside the modal if it occurred during confirmation
            ? `Error: ${error}. Are you sure you want to delete this post?`
            : "Are you sure you want to delete this post? This action cannot be undone."
        }
        confirmButtonText="Delete"
        isConfirming={isDeleting}
      />
    </main>
  );
}
