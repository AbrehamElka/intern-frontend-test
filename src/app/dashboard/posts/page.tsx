// app/dashboard/posts/page.tsx
import React from 'react';
import { redirect } from 'next/navigation'; // For error handling/redirects
import { headers } from 'next/headers'; // To forward cookies for server-side fetch
import AllPostsCard from '@/components/AllPostsCard'; // Import the new PostCard component
import Link from 'next/link';
import { Button } from '@/components/ui/button'

// Ensure this page is always rendered dynamically on the server
export const dynamic = 'force-dynamic';

// Define a type for your Post (reusing the interface)
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

// Helper function to fetch all posts data on the server
async function getAllPostsData(): Promise<Post[]> {
  const requestHeaders = await headers();
const cookieHeader = requestHeaders.get('cookie');
 // Still forward cookies, even if API isn't strictly protected, for consistency

  const nestJsApiUrl = process.env.NEXT_PUBLIC_NESTJS_API_URL;

  if (!nestJsApiUrl) {
    // This should ideally be caught during deployment/startup if missing
    console.error("API URL is not defined. Cannot fetch posts.");
    // In a real application, you might throw an error or show a global message
    // For this specific 'all posts' page, if it's meant to be public, you might not redirect
    // but rather display a system error message. For now, let's keep the redirect as a robust fallback.
    redirect('/auth/signin'); // Or redirect to an error page
  }

  const fetchOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // We send credentials just in case the API has partial protection or requires it
    // but for a truly public endpoint, it might not be strictly necessary.
    credentials: 'include',
    cache: 'no-store', // Always fetch fresh data
  };

  if (cookieHeader) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Cookie: cookieHeader,
    };
  }

  try {
    const response = await fetch(`${nestJsApiUrl}/posts`, fetchOptions); // Fetch all posts

    if (response.ok) {
      return await response.json() as Post[];
    } else if (response.status === 401 || response.status === 403) {
      // If the public API somehow returns 401/403 (e.g., global auth required)
      console.error(`Authentication error fetching all posts. Status: ${response.status}. Redirecting.`);
      redirect('/auth/signin');
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch all posts.`);
    }
  } catch (err: any) {
    throw new Error(err.message || `An unexpected error occurred while fetching all posts.`);
  }
}

export default async function PostsPage() {
  let posts: Post[] = [];
  let error: string | null = null;

  try {
    posts = await getAllPostsData();
  } catch (err: any) {
    error = err.message;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 px-4 py-8">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Posts</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          {/* You might offer a retry button or link back to dashboard/home */}
          <Link href="/dashboard">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 px-4 py-8">
      {/* Search and Filter Section - Remains as placeholder for now */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          <input
            type="text"
            placeholder="Search by title or content..."
            className="w-full md:flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex space-x-2 w-full md:w-auto">
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full">
              <option value="">Filter by Category</option>
              <option value="tech">Technology</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="travel">Travel</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full">
              <option value="">Sort by</option>
              <option value="latest">Latest</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600">No posts found yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {posts.map((post) => (
            <AllPostsCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Load More Button - Remains as placeholder for now */}
      <div className="text-center">
        <button className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
          Load More
        </button>
      </div>
    </main>
  );
}