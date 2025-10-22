import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Coffee, Eye, EyeOff, Loader2 } from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { signInSchema, type SignInData } from "@shared/schema";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useSupabaseAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInData) => {
    try {
      setError("");
      await signIn(data.email, data.password);
      setLocation("/"); // Redirect to dashboard
    } catch (err: any) {
      setError(err.message || "Sign in failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cafe-50 to-cafe-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-cafe-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Coffee className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-cafe-800 mb-2">Welcome Back</h1>
          <p className="text-cafe-600">Sign in to your Clickers Workspace</p>
        </div>

        {/* Sign In Form */}
        <Card className="border-cafe-200 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-cafe-800">Sign In</CardTitle>
            <CardDescription className="text-cafe-600">
              Enter your email and password to access your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-cafe-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="border-cafe-300 focus:border-cafe-500 focus:ring-cafe-500"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-cafe-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="border-cafe-300 focus:border-cafe-500 focus:ring-cafe-500 pr-10"
                    {...register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-cafe-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-cafe-500" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-cafe-600 hover:bg-cafe-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-cafe-600">
                Don't have an account?{" "}
                <Link href="/auth/signup">
                  <span className="text-cafe-600 hover:text-cafe-700 font-medium cursor-pointer">
                    Sign up
                  </span>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-cafe-500">
          <p>© 2024 Clickers Workspace. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
