// Login.tsx
import { useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import LoginForm from "@/components/LoginForm";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login failed");
      }

      const { token } = await res.json();
      
      // ✅ FIXED: Store token and hard redirect
      localStorage.setItem("authToken", token);
      window.location.href = "/"; // Hard redirect triggers AuthProvider re-render
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onLogin={handleLogin} loading={loading} error={error} />;
}
