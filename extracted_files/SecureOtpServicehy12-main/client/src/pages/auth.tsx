import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
import type { InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Redirect if already logged in
  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const loginForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left column - Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "login" | "register")}
          className="w-full max-w-md"
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to access your IndianOTP.in account
                </CardDescription>
              </CardHeader>
              <form
                onSubmit={loginForm.handleSubmit((data) =>
                  loginMutation.mutate(data)
                )}
              >
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      {...loginForm.register("username")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...loginForm.register("password")}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Join IndianOTP.in for secure OTP services
                </CardDescription>
              </CardHeader>
              <form
                onSubmit={registerForm.handleSubmit((data) =>
                  registerMutation.mutate(data)
                )}
              >
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Username</Label>
                    <Input
                      id="reg-username"
                      {...registerForm.register("username")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      {...registerForm.register("password")}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending
                      ? "Creating account..."
                      : "Create account"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right column - Hero section */}
      <div className="hidden lg:flex flex-1 bg-muted items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="flex justify-center mb-8">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">
            Secure OTP Verification Services
          </h1>
          <p className="text-muted-foreground mb-8">
            Join thousands of businesses using IndianOTP.in for reliable and secure
            OTP verification services. Get started today with our easy-to-use
            platform.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 justify-center">
              <Lock className="h-5 w-5 text-primary" />
              <span className="text-sm">End-to-end encryption</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm">Secure authentication</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
