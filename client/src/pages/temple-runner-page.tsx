```tsx
import { Navbar } from "@/components/layout/navbar";
import { TempleRunner } from "@/components/game/temple-runner";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function TempleRunnerPage() {
  const [_, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative">
        <TempleRunner />
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="pixel-font"
          >
            Back to Menu
          </Button>
        </div>
      </main>
    </div>
  );
}
```
