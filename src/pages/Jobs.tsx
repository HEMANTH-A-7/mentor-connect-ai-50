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
  MapPin, 
  Briefcase, 
  ExternalLink,
  Calendar,
  User,
  Plus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Jobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    description: "",
    job_type: "full_time",
    location: "",
    skills_required: [] as string[],
    application_url: "",
    is_referral: false,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      loadUserRole(session.user.id);
      loadJobs();
    });
  }, [navigate]);

  const loadUserRole = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    
    if (data) setUserRole(data.role);
  };

  const loadJobs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("job_postings")
      .select("*, poster:posted_by(full_name, company)")
      .order("created_at", { ascending: false });

    setJobs(data || []);
    setLoading(false);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("job_postings").insert([{
      title: newJob.title,
      company: newJob.company,
      description: newJob.description,
      job_type: newJob.job_type as any,
      location: newJob.location,
      skills_required: newJob.skills_required,
      application_url: newJob.application_url,
      is_referral: newJob.is_referral,
      posted_by: user.id,
    }]);

    if (error) {
      toast({
        title: "Error creating job",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Job posted successfully!" });
      setDialogOpen(false);
      setNewJob({
        title: "",
        company: "",
        description: "",
        job_type: "full_time",
        location: "",
        skills_required: [],
        application_url: "",
        is_referral: false,
      });
      loadJobs();
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case "full_time":
        return "bg-primary/10 text-primary border-primary/20";
      case "internship":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "part_time":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Job Opportunities</h1>
            <p className="text-muted-foreground">
              Explore opportunities and referrals from our alumni network
            </p>
          </div>
          {userRole === "alumni" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Post a New Opportunity</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateJob} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={newJob.company}
                      onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_type">Job Type</Label>
                    <Select
                      value={newJob.job_type}
                      onValueChange={(value) => setNewJob({ ...newJob, job_type: value })}
                    >
                      <SelectTrigger id="job_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="application_url">Application URL</Label>
                    <Input
                      id="application_url"
                      type="url"
                      value={newJob.application_url}
                      onChange={(e) => setNewJob({ ...newJob, application_url: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_referral"
                      checked={newJob.is_referral}
                      onChange={(e) => setNewJob({ ...newJob, is_referral: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="is_referral">This is a referral opportunity</Label>
                  </div>
                  <Button type="submit" className="w-full">Post Job</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <Card className="p-6 mb-8 shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Jobs Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="p-6 border-2 hover:shadow-lg transition-all hover:border-primary/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-1">{job.title}</h3>
                  <p className="text-lg text-muted-foreground mb-3">{job.company}</p>
                </div>
                {job.is_referral && (
                  <Badge className="bg-accent/10 text-accent border-accent/20">
                    Referral
                  </Badge>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <Badge className={getJobTypeColor(job.job_type)}>
                    {job.job_type.replace("_", " ")}
                  </Badge>
                </div>
                {job.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                {job.poster && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>By {job.poster.full_name}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {job.description}
              </p>

              {job.application_url && (
                <Button className="w-full" asChild>
                  <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply Now
                  </a>
                </Button>
              )}
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
