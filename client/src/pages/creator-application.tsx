import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertCreatorApplicationSchema, type InsertCreatorApplication } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function CreatorApplication() {
  const [step, setStep] = useState(1);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<InsertCreatorApplication>({
    resolver: zodResolver(insertCreatorApplicationSchema),
    defaultValues: {
      walletAddress: user?.walletAddress || "",
      experienceLevel: "beginner",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertCreatorApplication) => {
      const res = await apiRequest("POST", "/api/creator-applications", data);
      if (!res.ok) throw new Error("Failed to submit application");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const totalSteps = 4;
  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = (data: InsertCreatorApplication) => {
    if (step < totalSteps) {
      nextStep();
    } else {
      submitMutation.mutate(data);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Experience Level</h2>
            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Development Experience</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gameDevBackground"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Development Background</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your experience in game development..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Project Details</h2>
            <FormField
              control={form.control}
              name="projectProposal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Proposal</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the game you want to build..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Additional Information</h2>
            <FormField
              control={form.control}
              name="portfolioLinks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio Links (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Links to your previous work, GitHub, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredTechnologies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Technologies (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., React, Three.js, Unity, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-center mb-2">Creator Application</h1>
            <p className="text-muted-foreground text-center mb-8">
              Join our community of vibe coders and build the future of gaming
            </p>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="h-2 bg-muted rounded-full">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-muted-foreground text-center">
                Step {step} of {totalSteps}
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {renderStep()}

                <div className="flex justify-between pt-4">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                    >
                      Previous
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="ml-auto"
                    disabled={submitMutation.isPending}
                  >
                    {step === totalSteps ? "Submit Application" : "Next"}
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
