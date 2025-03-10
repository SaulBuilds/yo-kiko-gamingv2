import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [_, setLocation] = useLocation();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">Crypto Gaming</h1>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-muted-foreground">
                  {user.username}
                </span>
                <Button
                  variant="outline"
                  onClick={() => logoutMutation.mutate()}
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
