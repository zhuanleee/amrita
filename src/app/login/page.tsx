"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm p-8 bg-card">
        <div className="text-center mb-8">
          {/* Dewdrop Logo */}
          <svg
            viewBox="0 0 80 80"
            className="w-16 h-16 mx-auto mb-3"
            fill="none"
          >
            <path
              d="M40 4C40 4 12 31 12 46C12 61.5 24.5 74 40 74C55.5 74 68 61.5 68 46C68 31 40 4 40 4Z"
              stroke="#8a7a5a"
              strokeWidth="1.5"
              fill="none"
            />
            <text
              x="40"
              y="48"
              textAnchor="middle"
              fontFamily="serif"
              fontWeight="900"
              fontSize="18"
              fill="#1a1a1a"
            >
              甘露
            </text>
          </svg>
          <h1 className="text-xl font-[family-name:var(--font-eb-garamond)] tracking-[0.3em] text-gold uppercase">
            Amrita
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@amrita.my"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amrita-gold hover:bg-amrita-gold/90 text-white"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
