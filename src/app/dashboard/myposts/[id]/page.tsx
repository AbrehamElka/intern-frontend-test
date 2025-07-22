import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { headers } from "next/headers";

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

// Move headers() call *inside* this async function
async function getPostData(postId: number) {
  const requestHeaders = await headers(); // 🔁 FIXED HERE
  const cookieHeader = requestHeaders.get("cookie");

  const nestJsApiUrl = process.env.NEXT_PUBLIC_NESTJS_API_URL;
  if (!nestJsApiUrl) {
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
      redirect("/auth/signin");
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to fetch post with ID ${postId}.`
      );
    }
  } catch (err: any) {
    throw new Error(err.message || `Error while fetching post ${postId}.`);
  }
}

// ✅ FIX: Await `params` safely by using it properly within the async component
export default async function PostDetailPage(props: {
  params: { id: string };
}) {
  const { id } = await props.params; // ✅ destructure safely inside function body
  const postId = Number(id);

  if (isNaN(postId)) notFound();

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
            Error Loading Post
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 px-4 py-8 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{post.title}</h1>
          <Link href="/dashboard/myposts">
            <Button variant="outline" className="border-gray-300">
              Back to My Posts
            </Button>
          </Link>
        </div>

        <div className="text-gray-700 text-base leading-relaxed mb-6">
          <p>{post.description}</p>
        </div>

        <div className="text-sm text-gray-500 border-t pt-4">
          <p className="mb-1">
            <strong>Author:</strong> {post.author.name || post.author.email}
          </p>
          <p>
            <strong>Published On:</strong> {formatDate(post.createdAt)}
          </p>
        </div>

        <div className="flex gap-2 mt-8 justify-end">
          <Link href={`/dashboard/myposts/${post.id}/edit`}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Edit Post
            </Button>
          </Link>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            Delete Post
          </Button>
        </div>
      </div>
    </main>
  );
}
