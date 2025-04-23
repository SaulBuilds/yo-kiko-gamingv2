import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { SEO } from "@/components/seo";
import NotFound from "@/pages/not-found";
import SplashPage from "@/pages/splash-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import GamePage from "@/pages/game-page";
import NewGamePage from "@/pages/new-game-page";
import TempleRunnerPage from "@/pages/temple-runner-page";
import StreetFighterPage from "@/pages/street-fighter-page";
import CreatorApplication from "@/pages/creator-application";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SplashPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/game/new" component={NewGamePage} />
      <ProtectedRoute path="/game/:id" component={GamePage} />
      <ProtectedRoute path="/temple-runner" component={TempleRunnerPage} />
      <ProtectedRoute path="/street-fighter/practice" component={StreetFighterPage} />
      <ProtectedRoute path="/street-fighter/:id" component={StreetFighterPage} />
      <ProtectedRoute path="/creator-application" component={CreatorApplication} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Global SEO configuration */}
      <SEO />
      
      <AbstractWalletProvider 
        chain={abstractTestnet}
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router />
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </AbstractWalletProvider>
    </div>
  );
}

export default App;