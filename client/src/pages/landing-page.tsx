import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Image } from "@/components/ui/image";
import {
  Trophy,
  Gamepad2,
  Coins,
  Github,
  Twitter,
  MessagesSquare as Discord,
  Mail
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function LandingPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleBetaSignup = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thanks for signing up!",
      description: "We'll notify you when the beta is ready.",
    });
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-primary/5 py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold pixel-font bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                Turn Your Game Into A Vibe
              </h1>
              <p className="text-xl text-muted-foreground">
                Deploy your games on Yo-kiko, enable player wagering, and earn fees from every match. Built on Abstract and the Internet Computer Protocol.
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={() => setLocation("/auth")}
                  className="pixel-font"
                >
                  Start Building
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/auth")}
                  className="pixel-font"
                >
                  Play Now
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/assets/yo-kiko_lettermark.svg"
                alt="Yo-kiko Games"
                className="w-full h-auto animate-float"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 pixel-font">
            The Future of Gaming
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 space-y-4 hover:border-primary transition-all">
              <Gamepad2 className="w-12 h-12 text-primary" />
              <h3 className="text-xl font-bold pixel-font">Classic Games, Modern Tech</h3>
              <p className="text-muted-foreground">
                Build and deploy arcade-style games powered by blockchain technology and web3 integration.
              </p>
            </Card>
            <Card className="p-6 space-y-4 hover:border-primary transition-all">
              <Coins className="w-12 h-12 text-primary" />
              <h3 className="text-xl font-bold pixel-font">Skill-Based Wagering</h3>
              <p className="text-muted-foreground">
                Enable players to wager on matches using cryptocurrency or platform tokens.
              </p>
            </Card>
            <Card className="p-6 space-y-4 hover:border-primary transition-all">
              <Trophy className="w-12 h-12 text-primary" />
              <h3 className="text-xl font-bold pixel-font">Earn From Your Games</h3>
              <p className="text-muted-foreground">
                Collect fees from every match played in your custom game deployments.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section (New) */}
      <section className="py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold mb-8 pixel-font">How It Works</h2>
            <p className="text-xl text-muted-foreground mb-12">
              Yo-kiko is revolutionizing blockchain gaming by combining classic arcade fun with modern web3 technology.
              Deploy your own games, enable player wagering, and earn fees from every match.
            </p>
          </div>

          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-16 pixel-font">
              Deployed On
            </h3>
            <div className="flex justify-center items-center gap-16 mb-16">
              <div className="text-center">
                <Image
                  src="/assets/abstract_logo.svg"
                  alt="Abstract"
                  className="h-16 w-auto mb-4"
                />
                <p className="text-sm text-muted-foreground">Abstract Protocol</p>
              </div>
              <div className="text-center">
                <Image
                  src="/assets/icp_logo.svg"
                  alt="Internet Computer Protocol"
                  className="h-16 w-auto mb-4"
                />
                <p className="text-sm text-muted-foreground">Internet Computer Protocol</p>
              </div>
            </div>
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <p className="text-lg text-muted-foreground">
                Yo-kiko leverages Abstract Protocol's ZK rollup technology through the Abstract Global Wallet,
                enabling secure and efficient betting mechanisms with minimal gas fees.
              </p>
              <p className="text-lg text-muted-foreground">
                Our platform is hosted and deployed on the Internet Computer Protocol,
                ensuring a truly decentralized infrastructure that provides seamless
                scalability and unmatched reliability for your gaming experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Signup Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-8 pixel-font">
            Join the Beta Program
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Be among the first to deploy your games on Yo-kiko and start earning from player engagement.
          </p>
          <form onSubmit={handleBetaSignup} className="flex gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit">Sign Up</Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Image
                src="/assets/yo-kiko_lettermark.svg"
                alt="Yo-kiko"
                className="h-8 w-auto mb-4"
              />
              <p className="text-sm text-muted-foreground">
                The next generation of blockchain gaming.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Games</li>
                <li>Developer Tools</li>
                <li>Documentation</li>
                <li>API Reference</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Press Kit</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Discord className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Yo-kiko. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}