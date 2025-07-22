// components/AllPostsCard.tsx
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Assuming you have this

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

interface AllPostsCardProps {
  post: Post;
}

const AllPostsCard: React.FC<AllPostsCardProps> = ({ post }) => {
  // Simple date formatting for display
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
        <span>{post.author.name || post.author.email}</span>{" "}
        {/* Display author name or email */}
        <span>{formatDate(post.createdAt)}</span>
      </div>
      <div className="flex gap-2 mt-4">
        {/* Link to the dynamic post view page */}
        <Link href={`/dashboard/myposts/${post.id}`}>
          <Button variant="outline" className="border-gray-300">
            View Post
          </Button>
        </Link>
        {/* You might not want Edit/Delete buttons on a public 'all posts' page,
            as these are typically for the author only.
            If you do, you'd need client-side logic to conditionally render them
            based on user authorization, which is more complex here.
            For now, let's omit them to keep this page read-only for all.
        */}
      </div>
    </div>
  );
};

export default AllPostsCard; // Export as default
