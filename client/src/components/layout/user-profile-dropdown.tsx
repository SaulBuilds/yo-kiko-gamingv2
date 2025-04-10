import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, ChevronDown } from "lucide-react";
import { Image } from "@/components/ui/image";

export function UserProfileDropdown() {
  const { user, address } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [principal, setPrincipal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we have a stored ICP principal
    const savedPrincipal = localStorage.getItem('icp_principal');
    if (savedPrincipal) {
      setPrincipal(savedPrincipal);
    }
  }, []);

  // Helper function to shorten addresses for display
  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // If we have an ICP connection, clear it
      if (principal) {
        localStorage.removeItem('icp_principal');
        setPrincipal(null);
      }
      
      // Clear user data from cache
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logged Out",
        description: "Successfully disconnected",
      });

      // Redirect to home page
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "Error during logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user && !address && !principal) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar || ""} />
            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
          </Avatar>
          <span className="hidden md:inline">{user?.username || shortenAddress(address || "")}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Connected Accounts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {address && (
          <DropdownMenuItem className="flex items-center p-3">
            <div className="flex items-center gap-3 w-full">
              <Image src="/assets/abstract.svg" alt="Abstract" className="h-4 w-auto" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Abstract</p>
                <p className="text-xs text-muted-foreground">{shortenAddress(address)}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? "..." : <LogOut className="h-3 w-3" />}
              </Button>
            </div>
          </DropdownMenuItem>
        )}
        
        {principal && (
          <DropdownMenuItem className="flex items-center p-3">
            <div className="flex items-center gap-3 w-full">
              <Image src="/assets/IC_logo_horizontal_white.svg" alt="Internet Computer" className="h-4 w-auto" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Internet Identity</p>
                <p className="text-xs text-muted-foreground">{shortenAddress(principal)}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? "..." : <LogOut className="h-3 w-3" />}
              </Button>
            </div>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setLocation("/dashboard")}
        >
          <span>Dashboard</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}