import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "signin");

  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "student" as "student" | "alumni",
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let message = "";
    let color = "";

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score === 0 || password.length < 8) {
      message = "Too weak - Use at least 8 characters";
      color = "text-destructive";
    } else if (score <= 2) {
      message = "Weak - Add uppercase, numbers, and symbols";
      color = "text-orange-500";
    } else if (score === 3) {
      message = "Fair - Add more complexity";
      color = "text-yellow-500";
    } else if (score === 4) {
      message = "Good - Consider adding more characters";
      color = "text-blue-500";
    } else {
      message = "Strong password";
      color = "text-green-500";
    }

    setPasswordStrength({ score, message, color });
    return score >= 3;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: signInData.email,
      password: signInData.password,
    });

    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Welcome back!" });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpData.email || !signUpData.password || !signUpData.fullName) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    if (!checkPasswordStrength(signUpData.password)) {
      toast({
        title: "Weak Password",
        description: "Please use a stronger password (at least Fair rating)",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: signUpData.fullName,
          role: signUpData.role,
        },
      },
    });

    if (authError) {
      toast({
        title: "Error signing up",
        description: authError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: signUpData.email,
        full_name: signUpData.fullName,
        role: signUpData.role,
      });

      if (profileError) {
        toast({
          title: "Error creating profile",
          description: profileError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created!",
          description: "Please complete your profile setup.",
        });
        navigate("/profile-setup");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-4 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow transition-transform group-hover:scale-105">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              EduConnect
            </span>
          </Link>
          <p className="text-muted-foreground text-center">
            Connect with mentors and transform your career
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="your.email@college.edu"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signUpData.fullName}
                  onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your.email@college.edu"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-role">I am a</Label>
                <Select
                  value={signUpData.role}
                  onValueChange={(value: "student" | "alumni") =>
                    setSignUpData({ ...signUpData, role: value })
                  }
                >
                  <SelectTrigger id="signup-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Min 8 characters"
                  value={signUpData.password}
                  onChange={(e) => {
                    setSignUpData({ ...signUpData, password: e.target.value });
                    checkPasswordStrength(e.target.value);
                  }}
                  required
                  minLength={8}
                />
                {signUpData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i < passwordStrength.score
                              ? passwordStrength.score === 5
                                ? "bg-green-500"
                                : passwordStrength.score === 4
                                ? "bg-blue-500"
                                : passwordStrength.score === 3
                                ? "bg-yellow-500"
                                : "bg-orange-500"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${passwordStrength.color}`}>
                      {passwordStrength.message}
                    </p>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;