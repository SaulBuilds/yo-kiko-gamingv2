import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import GamePage from "@/pages/game-page";
import NewGamePage from "@/pages/new-game-page";
import TempleRunnerPage from "@/pages/temple-runner-page";
import StreetFighterPage from "@/pages/street-fighter-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <ProtectedRoute path="/dashboard" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/game/new" component={NewGamePage} />
      <ProtectedRoute path="/game/:id" component={GamePage} />
      <ProtectedRoute path="/temple-runner" component={TempleRunnerPage} />
      <ProtectedRoute path="/street-fighter/practice" component={StreetFighterPage} />
      <ProtectedRoute path="/street-fighter/:id" component={StreetFighterPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background">
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