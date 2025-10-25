import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Sparkles, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Loader2,
  UserPlus
} from "lucide-react";

const Mentors = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mentors, setMentors] = useState<any[]>([]);
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      loadMentors();
    });
  }, [navigate]);

  const loadMentors = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "alumni")
      .order("created_at", { ascending: false });

    setMentors(data || []);
    setLoading(false);
  };

  const getAIMatches = async () => {
    if (!user) return;
    setAiLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("match-mentors", {
        body: { userId: user.id },
      });

      if (error) throw error;

      setAiMatches(data.mentors);
      toast({
        title: "AI Matches Ready!",
        description: "We found the best mentors for you",
      });
    } catch (error: any) {
      toast({
        title: "Error getting AI matches",
        description: error.message,
        variant: "destructive",
      });
    }
    setAiLoading(false);
  };

  const sendConnectionRequest = async (mentorId: string) => {
    const { error } = await supabase.from("mentor_connections").insert({
      student_id: user.id,
      mentor_id: mentorId,
      status: "pending",
      message: "I'd love to connect with you and learn from your experience!",
    });

    if (error) {
      toast({
        title: "Error sending request",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Connection request sent!" });
      loadMentors();
    }
  };

  const filteredMentors = (aiMatches.length > 0 ? aiMatches : mentors).filter(
    (mentor) =>
      mentor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Mentor</h1>
          <p className="text-muted-foreground">
            Connect with experienced alumni who can guide your career journey
          </p>
        </div>

        {/* Search & AI Match */}
        <Card className="p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search by name, company, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={getAIMatches}
              disabled={aiLoading}
              className="shadow-md"
            >
              {aiLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Get AI Matches
            </Button>
          </div>
          {aiMatches.length > 0 && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-primary font-medium">
                <Sparkles className="w-4 h-4 inline mr-2" />
                Showing AI-powered matches based on your profile
              </p>
            </div>
          )}
        </Card>

        {/* Mentors Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading mentors...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card
                key={mentor.id}
                className="p-6 border-2 hover:shadow-lg transition-all hover:border-primary/20"
              >
                {/* AI Match Score */}
                {mentor.matchScore && (
                  <div className="mb-4">
                    <Badge className="bg-gradient-primary">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {mentor.matchScore}% Match
                    </Badge>
                  </div>
                )}

                {/* Avatar */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold shadow-md">
                    {mentor.full_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{mentor.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {mentor.job_title}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {mentor.company && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span>{mentor.company}</span>
                    </div>
                  )}
                  {mentor.department && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span>{mentor.department}</span>
                    </div>
                  )}
                  {mentor.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{mentor.location}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {mentor.skills && mentor.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {mentor.skills.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {mentor.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{mentor.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Reason */}
                {mentor.matchReason && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    <Sparkles className="w-3 h-3 inline mr-1 text-primary" />
                    {mentor.matchReason}
                  </p>
                )}

                {/* Bio */}
                {mentor.bio && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {mentor.bio}
                  </p>
                )}

                {/* Action */}
                <Button
                  className="w-full"
                  onClick={() => sendConnectionRequest(mentor.id)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </Card>
            ))}
          </div>
        )}

        {filteredMentors.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No mentors found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentors;
