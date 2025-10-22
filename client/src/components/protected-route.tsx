import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2, Coffee } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, profile } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/auth/signin");
    } else if (
      !isLoading && 
      isAuthenticated && 
      requireOnboarding && 
      profile && 
      profile.is_onboarding_complete === false
    ) {
      setLocation("/profile/setup");
    }
  }, [isLoading, isAuthenticated, profile, requireOnboarding, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cafe-50 to-cafe-100 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-cafe-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Coffee className="w-8 h-8 text-white" />
            </div>
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-cafe-600 mx-auto mb-4" />
          <p className="text-cafe-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to signin
  }

  if (requireOnboarding && profile && profile.is_onboarding_complete === false) {
    return null; // Will redirect to profile setup
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, profile } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (profile && profile.is_onboarding_complete === false) {
        setLocation("/profile/setup");
      } else {
        setLocation("/");
      }
    }
  }, [isLoading, isAuthenticated, profile, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cafe-50 to-cafe-100 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-cafe-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Coffee className="w-8 h-8 text-white" />
            </div>
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-cafe-600 mx-auto mb-4" />
          <p className="text-cafe-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard or profile setup
  }

  return <>{children}</>;
}
