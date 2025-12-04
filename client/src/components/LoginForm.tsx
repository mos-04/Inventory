// LoginForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  loading?: boolean;
  error?: string;
}

export default function LoginForm({ onLogin, loading = false, error }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-md bg-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">HR</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-semibold">Payroll System</CardTitle>
          <CardDescription>Sign in to access your HR dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                data-testid="input-username"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                data-testid="input-password"
                className="h-10"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-10"
              disabled={loading || !username || !password}
              data-testid="button-login"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          {/* ✅ Demo credentials */}
          <div className="mt-6 pt-6 border-t text-xs text-muted-foreground text-center">
            <p><strong>Demo Credentials:</strong></p>
            <p>username: <code>admin</code></p>
            <p>password: <code>admin123</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
