import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  Users, 
  Briefcase, 
  MessageSquare, 
  TrendingUp, 
  Shield,
  Sparkles,
  Target
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0YzAtMy4zMTQtMi42ODYtNi02LTZzLTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2IDYtMi42ODYgNi02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light border border-primary/20 mb-8 animate-in fade-in slide-in-from-top duration-700">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Mentorship Platform</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-bottom duration-700">
              Bridge the Gap Between{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Alumni & Students
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-100">
              Connect with mentors, discover career opportunities, and build meaningful relationships 
              through India's most trusted alumni-student network.
            </p>

            <div className="flex flex-wrap gap-4 justify-center animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              <Button size="lg" asChild className="shadow-lg">
                <Link to="/auth?tab=signup">
                  <Target className="w-5 h-5 mr-2" />
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Join 10,000+ students and alumni already connected
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make mentorship, career guidance, and networking effortless
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-2 hover:shadow-lg transition-all hover:border-primary/20">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Matching</h3>
              <p className="text-muted-foreground text-sm">
                Smart algorithm matches you with the perfect mentors based on your goals and interests
              </p>
            </Card>

            <Card className="p-6 border-2 hover:shadow-lg transition-all hover:border-secondary/20">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Verified Alumni</h3>
              <p className="text-muted-foreground text-sm">
                Connect with verified alumni from top institutions across India
              </p>
            </Card>

            <Card className="p-6 border-2 hover:shadow-lg transition-all hover:border-accent/20">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Job Referrals</h3>
              <p className="text-muted-foreground text-sm">
                Access exclusive job opportunities and trusted referrals from alumni
              </p>
            </Card>

            <Card className="p-6 border-2 hover:shadow-lg transition-all hover:border-primary/20">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Mentorship</h3>
              <p className="text-muted-foreground text-sm">
                Connect through secure messaging and schedule 1-on-1 mentorship sessions
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-primary-foreground/80">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-foreground/80">Institutions</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25K+</div>
              <div className="text-primary-foreground/80">Connections Made</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5K+</div>
              <div className="text-primary-foreground/80">Job Referrals</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center border-2 shadow-lg">
            <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Career Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students and alumni building meaningful connections and accelerating their careers
            </p>
            <Button size="lg" asChild>
              <Link to="/auth?tab=signup">
                <TrendingUp className="w-5 h-5 mr-2" />
                Start Connecting Today
              </Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 EduConnect. Empowering education through connections.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
