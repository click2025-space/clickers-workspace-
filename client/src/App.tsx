import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { SupabaseAuthProvider } from "@/contexts/supabase-auth-context";
import { ProtectedRoute, PublicRoute } from "@/components/protected-route";
import Dashboard from "@/pages/dashboard";
import VirtualOffices from "@/pages/virtual-offices";
import TasksBoard from "@/pages/tasks-board";
import TeamChat from "@/pages/team-chat";
import Members from "@/pages/members";
import Workspace from "@/pages/workspace";
import SettingsPage from "@/pages/settings";
import SignIn from "@/pages/auth/signin";
import SignUp from "@/pages/auth/signup";
import ProfileSetup from "@/pages/profile-setup";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/offices" component={VirtualOffices} />
              <Route path="/tasks" component={TasksBoard} />
              <Route path="/chat" component={TeamChat} />
              <Route path="/members" component={Members} />
              <Route path="/profile/:id" component={Workspace} />
              <Route path="/settings" component={SettingsPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/auth/signin">
        <PublicRoute>
          <SignIn />
        </PublicRoute>
      </Route>
      <Route path="/auth/signup">
        <PublicRoute>
          <SignUp />
        </PublicRoute>
      </Route>
      
      {/* Profile Setup Route (authenticated but no onboarding required) */}
      <Route path="/profile/setup">
        <ProtectedRoute requireOnboarding={false}>
          <ProfileSetup />
        </ProtectedRoute>
      </Route>
      
      {/* Protected Routes */}
      <Route>
        <ProtectedRoute>
          <AuthenticatedApp />
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <SupabaseAuthProvider>
            <Router />
            <Toaster />
          </SupabaseAuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
