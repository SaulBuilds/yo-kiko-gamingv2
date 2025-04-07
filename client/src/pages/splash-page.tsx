import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Gamepad2, Code2, Trophy, Github, Twitter, Linkedin } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { motion } from "framer-motion";
import { SEO } from "@/components/seo";

export default function SplashPage() {
  const [_, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const { user } = useAuth();

  // Redirect to dashboard if already authenticated
  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* SEO Meta Tags */}
      <SEO 
        title="Yokiko: Web3 Gaming Platform" 
        description="Play competitive blockchain games, place skill-based wagers, and earn ETH on the Yokiko gaming platform. Join our community of vibe coders, degens, and gamers!"
        image="/assets/yo.png"
      />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_100%)] opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-100 h-100 mx-auto mb-8">
              <img 
                src="/assets/yo-kiko_lettermark.svg" 
                alt="Yokiko Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 pixel-font bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
              Vibe Coders, Degens, Gamers
            </h1>
            <p className="text-2xl md:text-3xl mb-8 text-primary/20 pixel-font max-w-3xl mx-auto leading-relaxed">
              Level Up Your Gaming: Create, Play, and Earn in ETH
            </p>
            <Button 
              size="lg" 
              className="text-xl px-12 py-8 pixel-font bg-primary hover:bg-primary/90 transition-all"
              onClick={() => setLocation("/auth")}
            >
              Start Your Adventure
            </Button>
          </motion.div>
        </div>

        {/* Animated background elements */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s infinite linear`
              }}
            />
          ))}
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-32 bg-black/50">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 pixel-font text-primary">Why Choose Yo-Kiko?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div 
              className="p-8 rounded-lg bg-black/40 backdrop-blur-sm border border-primary/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Gamepad2 className="w-16 h-16 mb-6 text-primary" />
              <h3 className="text-2xl font-bold mb-4 pixel-font">Play to Earn</h3>
              <p className="text-lg text-gray-300">
                Challenge opponents in skill-based games and earn rewards through our secure wagering system.
              </p>
            </motion.div>
            <motion.div 
              className="p-8 rounded-lg bg-black/40 backdrop-blur-sm border border-primary/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Code2 className="w-16 h-16 mb-6 text-primary" />
              <h3 className="text-2xl font-bold mb-4 pixel-font">Create to Earn</h3>
              <p className="text-lg text-gray-300">
                Build and deploy your own games with AI assistance. Earn from every match played.
              </p>
            </motion.div>
            <motion.div 
              className="p-8 rounded-lg bg-black/40 backdrop-blur-sm border border-primary/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Trophy className="w-16 h-16 mb-6 text-primary" />
              <h3 className="text-2xl font-bold mb-4 pixel-font">Fair Competition</h3>
              <p className="text-lg text-gray-300">
                All games are validated for fairness. Pure skill-based mechanics. No pay-to-win.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technology Partners */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_100%)] opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-bold mb-16 pixel-font text-primary">Powered By</h2>
          <div className="flex justify-center items-center gap-16 flex-wrap">
            <motion.div 
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-40 h-40 mx-auto mb-8">
                <img 
                  src="/assets/abstract.svg" 
                  alt="Yokiko Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-50 h-50 mx-auto mb-8">
                <img 
                  src="/assets/IC_logo_horizontal_white.svg" 
                  alt="Yokiko Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 bg-black/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-8 pixel-font text-primary">Join the Revolution</h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto pixel-font">
            Are you ready to be part of the next generation of gaming? Join our community of vibe coders and players!
          </p>
          <Button 
            size="lg"
            onClick={() => setLocation("/auth")}
            className="text-xl px-12 py-8 pixel-font bg-primary hover:bg-primary/90"
          >
            Start Gaming Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-primary/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 pixel-font text-primary">Stay Updated</h3>
              <div className="flex gap-4">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/40 border-primary/20 text-white"
                />
                <Button className="pixel-font">Subscribe</Button>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6 pixel-font text-primary">Follow Us</h3>
              <div className="flex gap-6">
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <Twitter className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <Linkedin className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <Github className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-primary">
                  <SiTiktok className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
          <div className="text-center text-gray-500">
            <p className="pixel-font">&copy; 2024 sumthn.fun. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px) }
          50% { transform: translateY(-20px) }
          100% { transform: translateY(0px) }
        }
      `}</style>
    </div>
  );
}
