import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/Layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Vendors from "@/pages/Vendors";
import Customers from "@/pages/Customers";
import MilkReceiving from "@/pages/MilkReceiving";
import MilkSending from "@/pages/MilkSending";
import Payments from "@/pages/Payments";
import Reports from "@/pages/Reports";
import DatabaseManagement from "@/pages/DatabaseManagement";
import PendingPayments from "@/pages/PendingPayments";
import VendorLedger from "@/pages/VendorLedger";
import CustomerLedger from "@/pages/CustomerLedger";
import PWAInstallPrompt from "@/components/PWA/PWAInstallPrompt";
import OfflineIndicator from "@/components/PWA/OfflineIndicator";
import LoginPage from "@/components/Auth/LoginPage";
import usePWA from "@/hooks/usePWA";
import { useState, useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/vendors" component={Vendors} />
      <Route path="/customers" component={Customers} />
      <Route path="/milk-receiving" component={MilkReceiving} />
      <Route path="/milk-sending" component={MilkSending} />
      <Route path="/payments" component={Payments} />
      <Route path="/reports" component={Reports} />
      <Route path="/database" component={DatabaseManagement} />
      <Route path="/pending-payments" component={PendingPayments} />
      <Route path="/vendor-ledger" component={VendorLedger} />
      <Route path="/customer-ledger" component={CustomerLedger} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize PWA hooks
  usePWA();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const authStatus = localStorage.getItem("thar_dairy_auth");
    if (authStatus === "authenticated") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("thar_dairy_auth");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <LoginPage onLogin={handleLogin} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <OfflineIndicator />
        <PWAInstallPrompt />
        <AppLayout onLogout={handleLogout}>
          <Router />
        </AppLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
