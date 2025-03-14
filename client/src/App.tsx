import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import AuthPage from "@/pages/auth";
import RechargeRequests from "@/pages/admin/RechargeRequests";
import BuyNumbers from "@/pages/BuyNumbers";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  admin?: boolean;
  [key: string]: any;
}

function ProtectedRoute({ component: Component, admin = false, ...rest }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <AuthPage />;
  if (admin && !user.isAdmin) return <Dashboard />;

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/buy-numbers" component={() => <ProtectedRoute component={BuyNumbers} />} />
      <Route path="/admin/recharge-requests" component={() => <ProtectedRoute component={RechargeRequests} admin />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;