// app/signup/page.tsx
'use client'; // This directive is necessary for client-side components in Next.js App Router

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // For redirection after successful signup

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(''); // Assuming NestJS expects a 'name' field
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Basic client-side validation
    if (!email || !password || !confirmPassword || !name) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const nestJsApiUrl = process.env.NEXT_PUBLIC_NESTJS_API_URL;

      if (!nestJsApiUrl) {
        throw new Error("NEXT_PUBLIC_NESTJS_API_URL is not defined. Check your .env.local file.");
      }

      const response = await fetch(`${nestJsApiUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }), // Include name in the payload
      });

      if (!response.ok) {
        // Handle API errors (e.g., 400 Bad Request, 409 Conflict)
        const errorData = await response.json();
        // NestJS validation errors usually come in an 'message' array or string
        if (errorData.message && Array.isArray(errorData.message)) {
          setError(errorData.message.join(', '));
        } else if (errorData.message) {
          setError(errorData.message);
        } else {
          setError('An unexpected error occurred during signup.');
        }
        return; // Stop execution if there's an error
      }

      // Successful signup
      const data = await response.json();
      console.log('Signup successful:', data);
      alert('Account created successfully! You can now sign in.');
      router.push('/auth/signin'); // Redirect to sign-in page

    } catch (err: any) {
      console.error('Network or unexpected error:', err);
      setError(err.message || 'Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // REMOVED THE OUTER DIV with flex, justify-center, min-h-screen, bg-gray-100.
    // The layout (app/auth/layout.tsx) now handles these styles.
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl"> {/* Adjusted max-w to 2xl */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
        <p className="text-gray-600">Join us today</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
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
          <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
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
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-semibold mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-gray-600 text-sm mt-6">
        Already have an account?{' '}
        <Link href="/auth/signin" className="text-purple-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}