import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { UserProfileDropdown } from "./user-profile-dropdown";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/hooks/use-auth";
import { Gamepad } from "lucide-react";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, address } = useAuth();
  
  // Check if we have any kind of authentication
  const isAuthenticated = !!user || !!address || !!localStorage.getItem('icp_principal');

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => setLocation("/")}
            >
              <Image 
                src="/assets/yo-kiko_lettermark.svg" 
                alt="Yo-Kiko"
                className="h-8 w-auto"
              />
            </div>
            
            {isAuthenticated && (
              <div className="hidden md:flex items-center">
                <Button 
                  variant={location === "/dashboard" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setLocation("/dashboard")}
                >
                  <Gamepad className="h-4 w-4 mr-2" />
                  Games
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <UserProfileDropdown />
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation("/auth")}
              >
                Connect
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}