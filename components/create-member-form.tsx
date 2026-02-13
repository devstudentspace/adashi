"use client";

import { useState } from "react";
import { Plus, UserPlus, Phone, MapPin, Mail, KeyRound, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createMember } from "@/lib/actions";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  fullName: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  phoneNumber: z.string().regex(/^0\d{10}$/, {
    message: "Must be a valid Nigerian phone number (e.g. 08012345678).",
  }),
  altPhoneNumber: z.string().optional().refine((val) => !val || /^0\d{10}$/.test(val), {
    message: "Must be a valid Nigerian phone number.",
  }),
  email: z.string().email().optional().or(z.literal("")),
  homeAddress: z.string().optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional().or(z.literal("")),
});

export function CreateMemberForm() {
  const [open, setOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      altPhoneNumber: "",
      email: "",
      homeAddress: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await createMember({
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        altPhoneNumber: values.altPhoneNumber || undefined,
        email: values.email || undefined,
        homeAddress: values.homeAddress || undefined,
        password: values.password || undefined,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.success) {
        toast.success(`Member created! Password: ${result.tempPassword}`, {
            duration: 10000,
            description: "Please share this password with the member.",
        });
        setOpen(false);
        form.reset();
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto shadow-md hover:shadow-lg transition-all gap-2 px-5 py-6 rounded-xl">
          <Plus className="h-5 w-5" /> 
          <span className="font-semibold">Add New Member</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] z-[100] gap-0 p-0 overflow-y-auto max-h-[90vh]">
        <div className="p-6 pb-0">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <UserPlus className="h-6 w-6" />
              </div>
              <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">Create Member Account</DialogTitle>
                  <DialogDescription className="text-base text-muted-foreground">
                      Register a new participant to the Adashi portal.
                  </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 pt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Section */}
                <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-primary rounded-full" />
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Personal & Location</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                            <FormLabel className="text-sm font-semibold">Full Legal Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Ibrahim Yusuf" {...field} className="h-12 border-input focus:ring-1 focus:ring-primary transition-all rounded-xl bg-background" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="homeAddress"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                            <FormLabel className="text-sm font-semibold">Residential Address</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input placeholder="Market Road, Kano" {...field} className="pl-11 h-12 border-input focus:ring-1 focus:ring-primary transition-all rounded-xl bg-background" />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>

                {/* Contact Section */}
                <div className="space-y-4 md:col-span-2 pt-2">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-primary rounded-full" />
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Contact & Auth</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-sm font-semibold">Phone (Primary)</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input placeholder="080..." {...field} className="pl-11 h-12 border-input focus:ring-1 focus:ring-primary transition-all rounded-xl bg-background" />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="altPhoneNumber"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-sm font-semibold">Alt. Phone (Opt.)</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input placeholder="070..." {...field} className="pl-11 h-12 border-input focus:ring-1 focus:ring-primary transition-all rounded-xl bg-background" />
                                </div>
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
                            <FormLabel className="text-sm font-semibold">Email (Optional)</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input type="email" placeholder="Optional" {...field} className="pl-11 h-12 border-input focus:ring-1 focus:ring-primary transition-all rounded-xl bg-background" />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-sm font-semibold">Portal Password</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input type="text" placeholder="Defaults to Phone" {...field} className="pl-11 h-12 border-input focus:ring-1 focus:ring-primary transition-all rounded-xl bg-background" />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <p className="text-[11px] text-muted-foreground italic px-1">
                        * Email and Password are auto-generated from phone details if left empty.
                    </p>
                </div>
            </div>

            <DialogFooter className="pt-4 flex-row gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="flex-1 h-12 rounded-xl"
              >
                Discard
              </Button>
              <Button 
                type="submit" 
                className="flex-[2] h-12 rounded-xl font-bold" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Confirm & Create Member"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}