// app/dashboard/myposts/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { headers } from "next/headers"; // To forward cookies for server-side fetch
import { PostEditForm } from "@/components/PostEditForm"; // Import the new client component

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

// Helper function to fetch post data on the server
async function getPostData(postId: number): Promise<Post> {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie");

  const nestJsApiUrl = process.env.NEXT_PUBLIC_NESTJS_API_URL;

  if (!nestJsApiUrl) {
    console.error("API URL is not defined. Redirecting.");
    redirect("/auth/signin");
  }

  const fetchOptions: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  };

  if (cookieHeader) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Cookie: cookieHeader,
    };
  }

  try {
    const response = await fetch(
      `${nestJsApiUrl}/posts/${postId}`,
      fetchOptions
    );

    if (response.ok) {
      return (await response.json()) as Post;
    } else if (response.status === 404) {
      notFound();
    } else if (response.status === 401 || response.status === 403) {
      console.error(
        `Authentication error fetching post ${postId}. Status: ${response.status}. Redirecting.`
      );
      redirect("/auth/signin");
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to fetch post with ID ${postId}.`
      );
    }
  } catch (err: any) {
    throw new Error(
      err.message ||
        `An unexpected error occurred while fetching post ${postId}.`
    );
  }
}

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const postId = parseInt(params.id, 10);

  if (isNaN(postId)) {
    notFound();
  }

  let post: Post | null = null;
  let error: string | null = null;

  try {
    post = await getPostData(postId);
  } catch (err: any) {
    error = err.message;
  }

  if (error || !post) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 px-4 py-8">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Post for Editing
          </h2>
          <p className="text-gray-700 mb-6">
            {error || "Post data could not be retrieved."}
          </p>
          <Link href="/dashboard/myposts">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md">
              Back to My Posts
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 px-4 py-8 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Edit Post: "{post.title}"
          </h1>
          <Link href={`/dashboard/myposts/${post.id}`}>
            <Button variant="outline" className="border-gray-300">
              Back to Post
            </Button>
          </Link>
        </div>
        {/* Render the Client Component and pass the fetched post data */}
        <PostEditForm initialPost={post} />
      </div>
    </main>
  );
}
