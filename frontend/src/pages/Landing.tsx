import { Link } from "wouter";
import { Shield, BookOpen, AlertTriangle, BarChart3, ChevronRight, Lock, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">CyberShield AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" data-testid="link-login">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" data-testid="link-register">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6">
            <Zap className="h-3 w-3" /> AI-Powered Threat Analysis
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Cybersecurity Awareness<br />
            <span className="text-primary">Built for the Modern Threat</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Train your team with real cybersecurity courses, test knowledge with adaptive quizzes,
            and report threats with AI-powered analysis — all in one platform.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register">
              <Button size="lg" className="gap-2" data-testid="button-get-started">
                Start Learning Free <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" data-testid="button-sign-in">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete cybersecurity training and threat management platform for educational institutions and enterprises.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Cybersecurity Courses", desc: "Structured learning paths covering phishing, password security, social engineering, and more." },
              { icon: BarChart3, title: "Adaptive Quizzes", desc: "Test and reinforce knowledge with targeted quizzes. Track scores and completion across your team." },
              { icon: AlertTriangle, title: "AI Threat Reporting", desc: "Submit suspicious incidents and get instant AI-powered analysis — risk level, category, and recommendations." },
              { icon: Shield, title: "Role-Based Access", desc: "Separate dashboards for users and administrators with granular permission control." },
              { icon: Users, title: "User Management", desc: "Admins can manage users, monitor progress, and track engagement across the platform." },
              { icon: Lock, title: "Secure by Design", desc: "JWT authentication, bcrypt password hashing, and encrypted sessions throughout." },
            ].map((f) => (
              <Card key={f.title} className="bg-card border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <f.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-border/50">
        <div className="max-w-2xl mx-auto text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to Strengthen Your Defenses?</h2>
          <p className="text-muted-foreground mb-8">
            Join CyberShield AI and build a security-first culture from the ground up.
          </p>
          <Link href="/register">
            <Button size="lg" data-testid="button-cta-register">Create Your Account</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/50 py-6 px-6 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium">CyberShield AI</span>
        </div>
        <p>Cybersecurity Awareness &amp; Threat Reporting Platform — Final Year Project</p>
      </footer>
    </div>
  );
}
