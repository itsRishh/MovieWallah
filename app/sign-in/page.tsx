"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);

    const { error } = await authClient.signUp.email(
      {
        email,
        password,
        name, // ✅ correct field
        callbackURL: "/dashboard",
      },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (ctx) => {
          alert(ctx.error.message);
        },
      }
    );

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">

      <Link href="/login" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition">
        Already have an account? Login  
      </Link>
      <div className="sign-up flex flex-col items-center gap-4 ">
        <label>Sign up</label>

      <input
        className="border border-white p-2 rounded-md"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border border-white p-2 rounded-md"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border border-white p-2 rounded-md"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSignup}
        disabled={loading}
        className="px-4 py-2 bg-white text-black rounded"
      >
        {loading ? "Signing up..." : "Signup"}
      </button>
      </div>
    </div>
  );
}