import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Briefcase, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  UserPlus
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      loadDashboardData(session.user.id);
    });
  }, [navigate]);

  const loadDashboardData = async (userId: string) => {
    setLoading(true);

    // Load profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileData) {
      setProfile(profileData);

      // Load connections
      const { data: connectionsData } = await supabase
        .from("mentor_connections")
        .select(`
          *,
          mentor:mentor_id(full_name, job_title, company, avatar_url),
          student:student_id(full_name, department, avatar_url)
        `)
        .or(`student_id.eq.${userId},mentor_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(5);

      setConnections(connectionsData || []);

      // Load recent jobs
      const { data: jobsData } = await supabase
        .from("job_postings")
        .select("*, poster:posted_by(full_name, company)")
        .order("created_at", { ascending: false })
        .limit(4);

      setRecentJobs(jobsData || []);
    }

    setLoading(false);
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-accent/10 text-accent border-accent/20";
      case "pending":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-muted-foreground">
            {profile?.role === "student"
              ? "Continue your journey to connect with amazing mentors"
              : "Help students succeed by sharing your experience"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-2 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{connections.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Connections</p>
          </Card>

          <Card className="p-6 border-2 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="w-5 h-5 text-secondary" />
              <span className="text-2xl font-bold">{recentJobs.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Jobs</p>
          </Card>

          <Card className="p-6 border-2 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              <span className="text-2xl font-bold">
                {connections.filter((c) => c.status === "accepted").length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Active Chats</p>
          </Card>

          <Card className="p-6 border-2 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">85%</span>
            </div>
            <p className="text-sm text-muted-foreground">Profile Complete</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Connections */}
          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Connections</h2>
              <Button variant="outline" size="sm" asChild>
                <Link to="/mentors">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Find More
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              {connections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No connections yet</p>
                  <Button className="mt-4" asChild>
                    <Link to="/mentors">Start Connecting</Link>
                  </Button>
                </div>
              ) : (
                connections.map((connection) => {
                  const otherUser =
                    connection.student_id === profile?.id
                      ? connection.mentor
                      : connection.student;
                  return (
                    <Card key={connection.id} className="p-4 border hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {otherUser?.full_name?.[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{otherUser?.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {otherUser?.job_title || otherUser?.department}
                          </p>
                        </div>
                        <Badge className={getConnectionStatusColor(connection.status)}>
                          {connection.status === "accepted" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {connection.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                          {connection.status}
                        </Badge>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </Card>

          {/* Recent Job Postings */}
          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Opportunities</h2>
              <Button variant="outline" size="sm" asChild>
                <Link to="/jobs">View All</Link>
              </Button>
            </div>

            <div className="space-y-4">
              {recentJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No jobs posted yet</p>
                </div>
              ) : (
                recentJobs.map((job) => (
                  <Card key={job.id} className="p-4 border hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{job.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {job.company} • {job.location}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{job.job_type}</Badge>
                          {job.is_referral && (
                            <Badge className="bg-accent/10 text-accent border-accent/20">
                              Referral
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
