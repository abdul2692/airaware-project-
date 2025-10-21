import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, MapPin, Calendar, AlertTriangle, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReportStatus from "@/components/ReportStatus";

interface PollutionReport {
  id: string;
  type: string;
  severity: string;
  location: string;
  description: string | null;
  status: string;
  submitted_at: string;
  updated_at: string;
  investigation_started_at?: string | null;
  resolved_at?: string | null;
}

const ReportsStatus = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<PollutionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isNodalOfficer, setIsNodalOfficer] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkNodalOfficerRole(session.user.id);
      } else {
        setIsNodalOfficer(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkNodalOfficerRole(session.user.id);
      }
    });

    fetchReports();

    return () => subscription.unsubscribe();
  }, []);

  const checkNodalOfficerRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'nodal_officer')
        .maybeSingle();

      if (error) throw error;
      setIsNodalOfficer(!!data);
    } catch (error) {
      console.error('Error checking role:', error);
      setIsNodalOfficer(false);
    }
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('pollution_reports')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'investigating' && !reports.find(r => r.id === reportId)?.investigation_started_at) {
        updateData.investigation_started_at = new Date().toISOString();
      } else if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('pollution_reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;
      
      toast.success(`Report status updated to ${newStatus}`);
      fetchReports();
    } catch (error: any) {
      console.error('Error updating report:', error);
      toast.error("Failed to update report status");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'investigating': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'resolved': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const filteredReports = reports.filter(report =>
    report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedReport) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button
            onClick={() => setSelectedReport(null)}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Reports
          </Button>
          <ReportStatus report={selectedReport} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          {user ? (
            <div className="flex items-center gap-4">
              {isNodalOfficer && (
                <Badge variant="outline" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Nodal Officer
                </Badge>
              )}
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate("/auth")} variant="default">
              Login
            </Button>
          )}
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Reports <span className="gradient-text">Status Dashboard</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Track and monitor all pollution reports submitted by the community
          </p>
        </div>

        <Card className="glass-card p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by location, type, or report ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Reports Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "No reports match your search criteria" : "No pollution reports have been submitted yet"}
            </p>
            <Button onClick={() => navigate("/#report")}>
              Submit a Report
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredReports.map((report) => (
              <Card
                key={report.id}
                className="glass-card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col gap-4">
                  <div 
                    className="cursor-pointer flex-1"
                    onClick={() => setSelectedReport({
                      id: report.id,
                      type: report.type,
                      severity: report.severity,
                      location: report.location,
                      description: report.description,
                      status: report.status,
                      submittedAt: new Date(report.submitted_at),
                    })}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status.toUpperCase()}
                      </Badge>
                      <Badge className={getSeverityColor(report.severity)}>
                        {report.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 capitalize">
                      {report.type.replace('-', ' ')} Pollution
                    </h3>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{report.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(report.submitted_at).toLocaleDateString()} at{' '}
                          {new Date(report.submitted_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Report ID: {report.id.slice(0, 8)}</p>
                  </div>

                  {isNodalOfficer && (
                    <div className="pt-4 border-t flex items-center gap-4">
                      <label className="text-sm font-medium">Update Status:</label>
                      <Select
                        value={report.status}
                        onValueChange={(value) => handleStatusUpdate(report.id, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
            <h4 className="font-semibold mb-2 text-sm">Pending</h4>
            <p className="text-2xl font-bold text-yellow-600">
              {reports.filter(r => r.status === 'pending').length}
            </p>
          </Card>
          <Card className="p-4 bg-blue-500/5 border-blue-500/20">
            <h4 className="font-semibold mb-2 text-sm">Investigating</h4>
            <p className="text-2xl font-bold text-blue-600">
              {reports.filter(r => r.status === 'investigating').length}
            </p>
          </Card>
          <Card className="p-4 bg-green-500/5 border-green-500/20">
            <h4 className="font-semibold mb-2 text-sm">Resolved</h4>
            <p className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.status === 'resolved').length}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsStatus;
