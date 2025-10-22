import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Coffee, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { signUpSchema, type SignUpData } from "@shared/schema";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const { signUp } = useSupabaseAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
  });

  const password = watch("password");

  const onSubmit = async (data: SignUpData) => {
    try {
      setError("");
      await signUp(data.email, data.password);
      setLocation("/profile/setup"); // Redirect to profile setup
    } catch (err: any) {
      setError(err.message || "Sign up failed. Please try again.");
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
    
    return {
      strength,
      label: labels[strength - 1] || "",
      color: colors[strength - 1] || "bg-gray-300",
    };
  };

  const passwordStrength = getPasswordStrength(password || "");

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
          <h1 className="text-3xl font-bold text-cafe-800 mb-2">Join Clickers</h1>
          <p className="text-cafe-600">Create your workspace account</p>
        </div>

        {/* Sign Up Form */}
        <Card className="border-cafe-200 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-cafe-800">Create Account</CardTitle>
            <CardDescription className="text-cafe-600">
              Enter your details to create your workspace account
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
                    placeholder="Create a password"
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
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-cafe-600">{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-cafe-700">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="border-cafe-300 focus:border-cafe-500 focus:ring-cafe-500 pr-10"
                    {...register("confirmPassword")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-cafe-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-cafe-500" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="space-y-3 text-sm text-cafe-600">
                <p className="font-medium">Password requirements:</p>
                <div className="grid grid-cols-1 gap-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${password && password.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${password && /[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-300'}`} />
                    <span>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${password && /[0-9]/.test(password) ? 'text-green-500' : 'text-gray-300'}`} />
                    <span>One number</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-cafe-600 hover:bg-cafe-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-cafe-600">
                Already have an account?{" "}
                <Link href="/auth/signin">
                  <span className="text-cafe-600 hover:text-cafe-700 font-medium cursor-pointer">
                    Sign in
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
