import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image } from "@/components/ui/image";
import { Card } from "@/components/ui/card";
import { 
  Github, 
  Twitter, 
  MessageSquare, 
  Mail,
  ArrowRight,
  Gamepad2,
  Code,
  Coins,
  Trophy
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function LandingPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thanks for subscribing!",
      description: "We'll keep you updated on our beta launch.",
    });
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <Image 
              src="/assets/yo-kiko_lettermark.svg" 
              alt="Yo-Kiko"
              className="h-20 w-auto mx-auto mb-8"
            />
            <h1 className="text-4xl md:text-6xl font-bold pixel-font bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              Wager on Classic Games
              <br />
              Create Your Own Vibe
            </h1>
            <p className="text-xl text-muted-foreground">
              Challenge friends in skill-based arcade games, deploy your own custom games,
              and earn rewards on the Internet Computer Protocol.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button 
                size="lg"
                className="pixel-font text-lg"
                onClick={() => setLocation("/auth")}
              >
                Join the Beta <ArrowRight className="ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="pixel-font text-lg"
                onClick={() => setLocation("/games")}
              >
                Explore Games
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 space-y-4">
              <Gamepad2 className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold pixel-font">Classic Arcade Games</h3>
              <p className="text-muted-foreground">
                Play beloved classics like Street Fighter, Temple Runner, and more with
                a competitive twist.
              </p>
            </Card>
            <Card className="p-6 space-y-4">
              <Coins className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold pixel-font">Skill-Based Wagering</h3>
              <p className="text-muted-foreground">
                Challenge friends to matches and wager cryptocurrency or XP points
                on your gaming skills.
              </p>
            </Card>
            <Card className="p-6 space-y-4">
              <Code className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold pixel-font">Deploy Your Games</h3>
              <p className="text-muted-foreground">
                Create and deploy your own games on our platform. Earn fees from
                every match played.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Beta Signup Section */}
      <div className="py-20 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <Trophy className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-3xl font-bold pixel-font">Join Our Beta</h2>
            <p className="text-lg text-muted-foreground">
              Be among the first to experience the future of competitive gaming.
              Deploy your games on the Internet Computer Protocol and start earning.
            </p>
            <Button 
              size="lg" 
              className="pixel-font text-lg"
              onClick={() => setLocation("/auth")}
            >
              Sign Up with Abstract
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Image 
                src="/assets/yo-kiko_lettermark.svg" 
                alt="Yo-Kiko"
                className="h-8 w-auto"
              />
              <p className="text-sm text-muted-foreground">
                The future of competitive gaming on the Internet Computer Protocol.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Games</li>
                <li>Developer Portal</li>
                <li>Documentation</li>
                <li>API Reference</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About</li>
                <li>Careers</li>
                <li>Press Kit</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Newsletter</h4>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 Yo-Kiko. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <MessageSquare className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}