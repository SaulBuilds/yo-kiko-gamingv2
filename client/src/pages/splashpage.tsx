import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Gamepad2, Code2, Trophy, Coins, Github, Twitter, Linkedin } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";


export default function HomePage() {
  const [_, setLocation] = useLocation();
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-background z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
              Build. Play. Earn.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto">
              Create and monetize skill-based games on the first decentralized gaming platform powered by blockchain technology.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => setLocation("/auth")}
            >
              Start Gaming Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Our Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 hover:border-primary transition-all">
              <Gamepad2 className="w-12 h-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Play to Earn</h3>
              <p className="text-muted-foreground">
                Compete in skill-based games and earn rewards through our secure wagering system.
              </p>
            </Card>
            <Card className="p-6 hover:border-primary transition-all">
              <Code2 className="w-12 h-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Create to Earn</h3>
              <p className="text-muted-foreground">
                Build and deploy your own games using AI assistance and earn from every play.
              </p>
            </Card>
            <Card className="p-6 hover:border-primary transition-all">
              <Trophy className="w-12 h-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Fair Competition</h3>
              <p className="text-muted-foreground">
                All games are validated for fairness and skill-based mechanics.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Partners */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-16">Powered By</h2>
          <div className="flex justify-center items-center gap-12 flex-wrap">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">Abstract</span>
              </div>
              <p className="text-muted-foreground">Abstract Chain</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">ICP</span>
              </div>
              <p className="text-muted-foreground">Internet Computer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Form */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Join the Creator Program</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Calling all vibe coders! Build the next generation of skill-based games and earn rewards.
          </p>
          <Button 
            size="lg"
            onClick={() => setLocation("/creator-application")}
            className="text-lg px-8"
          >
            Apply as Creator
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Stay Updated</h3>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="max-w-xs"
                />
                <Button>Subscribe</Button>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Linkedin className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Github className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <SiTiktok className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 sumthn.fun. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}