import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, PieChart, Users, Smartphone } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-primary">
            <ShieldCheck className="h-6 w-6" />
            <span>Adashi<span className="text-foreground">Manager</span></span>
          </div>
          <nav className="flex items-center gap-4">
            <ThemeSwitcher />
            <Link href="/auth/login">
              <Button variant="ghost" className="font-medium">
                Log in
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="font-medium">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col gap-4 animate-in slide-in-from-left-5 fade-in duration-500">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Modernizing Trust, <br className="hidden lg:block" />
              <span className="text-primary">Securing Savings.</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              The Digital Adashi Manager ("Amana" Suite). Automate your Akawo, Kwanta, and Ajita operations with a platform built for transparency.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="h-12 px-8 text-lg">
                  Start Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:block animate-in slide-in-from-right-5 fade-in duration-700">
             {/* Abstract Dashboard Graphic */}
             <div className="relative rounded-xl border bg-card p-4 shadow-2xl">
                <div className="absolute -top-12 -left-12 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
                <div className="space-y-4">
                  <div className="h-8 w-1/3 rounded-lg bg-muted" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 rounded-lg bg-primary/10 p-4">
                      <div className="h-full w-full rounded bg-primary/20" />
                    </div>
                    <div className="h-24 rounded-lg bg-muted p-4">
                       <div className="h-full w-full rounded bg-muted-foreground/10" />
                    </div>
                    <div className="h-24 rounded-lg bg-muted p-4">
                       <div className="h-full w-full rounded bg-muted-foreground/10" />
                    </div>
                  </div>
                  <div className="h-40 rounded-lg bg-muted p-4">
                    <div className="h-full w-full rounded bg-muted-foreground/10" />
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-12 md:py-24 lg:py-32 bg-secondary/30 rounded-3xl my-8">
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-3">
            <div className="flex flex-col gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Digital Ledger</h3>
              <p className="text-muted-foreground">
                Ditch the paper cards. Record daily payments instantly on your phone or laptop.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Member Portal</h3>
              <p className="text-muted-foreground">
                Build trust by giving your members read-only access to view their savings history.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PieChart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Automated Math</h3>
              <p className="text-muted-foreground">
                Auto-calculate payouts, service charges, and rotating roster schedules (Kwanta).
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              Ready to modernize your Adashi?
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Join thousands of managers building trust with the Amana Suite.
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="mt-4">
                Create Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2026 AdashiManager. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}