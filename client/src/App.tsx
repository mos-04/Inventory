import { useState, createContext, useContext, ReactNode, Suspense, lazy, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Attendance from "@/pages/Attendance";
import Payroll from "@/pages/Payroll";
import Reports from "@/pages/Reports";
import Leaves from "@/pages/Leaves";
import Indemnity from "@/pages/Indemnity";
import { apiFetch, setAuthToken } from "@/lib/apiFetch";
import Login from "@/pages/Login";
// ✅ Auth Context
interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// ✅ Auth Provider
function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  // Hydrate token on first mount
  useEffect(() => {
    const stored = localStorage.getItem("authToken");
    if (stored) {
      setToken(stored);
      setAuthToken(stored); // ✅ make apiFetch send Authorization
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("authToken", newToken);
    setAuthToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setAuthToken("");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ SIMPLE Router - NO useAuth() inside
function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/employees" component={Employees} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/payroll" component={Payroll} />
      <Route path="/leaves" component={Leaves} />
      <Route path="/indemnity" component={Indemnity} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}


// ✅ Header with Logout (SAFE - rendered inside AuthProvider)
function AppHeader() {
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={logout}
          className="text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors"
          data-testid="button-logout"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

// ✅ AppContent - uses useAuth() AFTER AuthProvider wraps it
function AppContent() {
  const { isAuthenticated } = useAuth(); // ✅ SAFE - inside AuthProvider

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Login />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-8">
          <Router /> {/* ✅ All routes available when authenticated */}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider> {/* ✅ Everything inside here has context */}
        <TooltipProvider>
          <SidebarProvider style={style}>
            <AppContent /> {/* ✅ useAuth() works here */}
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export { useAuth };
