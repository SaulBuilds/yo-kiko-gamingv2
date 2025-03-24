import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ErrorBoundary } from "@/components/error-boundary";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import GamePage from "@/pages/game-page";
import NewGamePage from "@/pages/new-game-page";
import TempleRunnerPage from "@/pages/temple-runner-page";
import StreetFighterPage from "@/pages/street-fighter-page";
import LandingPage from "@/pages/landing-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/app" component={HomePage} />
      <ProtectedRoute path="/app/game/new" component={NewGamePage} />
      <ProtectedRoute path="/app/game/:id" component={GamePage} />
      <ProtectedRoute path="/app/temple-runner" component={TempleRunnerPage} />
      <ProtectedRoute path="/app/street-fighter/practice" component={StreetFighterPage} />
      <ProtectedRoute path="/app/street-fighter/:id" component={StreetFighterPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AbstractWalletProvider chain={abstractTestnet}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Router />
              <Toaster />
            </div>
          </AuthProvider>
        </QueryClientProvider>
      </AbstractWalletProvider>
    </ErrorBoundary>
  );
}

export default App;