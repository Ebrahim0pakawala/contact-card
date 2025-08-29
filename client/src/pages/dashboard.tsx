import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Users,
  MousePointer,
  Eye,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

interface ButtonClick {
  id: string;
  buttonType: string;
  buttonLabel: string;
  clickedAt: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

interface DashboardStats {
  clickStats: { buttonType: string; buttonLabel: string; count: number }[];
  totalSubmissions: number;
  recentSubmissions: ContactSubmission[];
  recentClicks: ButtonClick[];
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "submissions" | "clicks">("overview");

  const { data: statsData } = useQuery<{ success: boolean; data: DashboardStats }>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: submissionsData } = useQuery<{ success: boolean; data: ContactSubmission[] }>({
    queryKey: ["/api/dashboard/submissions"],
    enabled: activeTab === "submissions",
  });

  const { data: clicksData } = useQuery<{ success: boolean; data: ButtonClick[] }>({
    queryKey: ["/api/dashboard/clicks"],
    enabled: activeTab === "clicks",
  });

  const stats = statsData?.data;
  const submissions = submissionsData?.data || stats?.recentSubmissions || [];
  const clicks = clicksData?.data || stats?.recentClicks || [];

  const getButtonTypeIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "whatsapp":
        return <MessageSquare className="w-4 h-4" />;
      case "website":
        return <Eye className="w-4 h-4" />;
      case "social":
        return <Users className="w-4 h-4" />;
      default:
        return <MousePointer className="w-4 h-4" />;
    }
  };

  const totalClicks = stats?.clickStats.reduce((sum, stat) => sum + stat.count, 0) || 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Contact Page
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bright Electricals - Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track contact form submissions and user engagement
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 mb-8"
        >
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "submissions", label: "Form Submissions", icon: Mail },
            { id: "clicks", label: "Click Tracking", icon: MousePointer },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className="flex items-center gap-2"
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </motion.div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card data-testid="card-submissions">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalSubmissions || 0}</div>
                  <p className="text-xs text-muted-foreground">Contact form submissions</p>
                </CardContent>
              </Card>

              <Card data-testid="card-clicks">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalClicks}</div>
                  <p className="text-xs text-muted-foreground">Button interactions</p>
                </CardContent>
              </Card>

              <Card data-testid="card-engagement">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalSubmissions ? 
                      Math.round((stats.totalSubmissions / Math.max(totalClicks, 1)) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Submissions to clicks ratio</p>
                </CardContent>
              </Card>
            </div>

            {/* Click Stats */}
            <Card data-testid="card-click-stats">
              <CardHeader>
                <CardTitle>Popular Buttons</CardTitle>
                <CardDescription>Most clicked buttons and links</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.clickStats.slice(0, 5).map((stat, index) => (
                    <div
                      key={`${stat.buttonType}-${stat.buttonLabel}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      data-testid={`click-stat-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        {getButtonTypeIcon(stat.buttonType)}
                        <div>
                          <div className="font-medium">{stat.buttonLabel}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {stat.buttonType}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary">{stat.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="card-recent-submissions">
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                  <CardDescription>Latest contact form submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.recentSubmissions.slice(0, 5).map((submission, index) => (
                      <div
                        key={submission.id}
                        className="p-3 rounded-lg bg-muted/50"
                        data-testid={`recent-submission-${index}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">{submission.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(submission.createdAt), "MMM dd, HH:mm")}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{submission.email}</div>
                        <div className="text-sm text-primary">{submission.service}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-recent-clicks">
                <CardHeader>
                  <CardTitle>Recent Clicks</CardTitle>
                  <CardDescription>Latest button interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.recentClicks.slice(0, 5).map((click, index) => (
                      <div
                        key={click.id}
                        className="p-3 rounded-lg bg-muted/50"
                        data-testid={`recent-click-${index}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {getButtonTypeIcon(click.buttonType)}
                            <div className="font-medium">{click.buttonLabel}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(click.clickedAt), "MMM dd, HH:mm")}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {click.buttonType}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Submissions Tab */}
        {activeTab === "submissions" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card data-testid="card-submissions-table">
              <CardHeader>
                <CardTitle>Contact Form Submissions</CardTitle>
                <CardDescription>All contact form submissions from users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission, index) => (
                      <TableRow key={submission.id} data-testid={`submission-row-${index}`}>
                        <TableCell className="text-sm">
                          {format(new Date(submission.createdAt), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="font-medium">{submission.name}</TableCell>
                        <TableCell>{submission.email}</TableCell>
                        <TableCell>{submission.phone || "-"}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                            {submission.service}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={submission.message}>
                          {submission.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {submissions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No submissions found
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Clicks Tab */}
        {activeTab === "clicks" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card data-testid="card-clicks-table">
              <CardHeader>
                <CardTitle>Button Click Tracking</CardTitle>
                <CardDescription>All button clicks and user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Button</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>User Agent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clicks.map((click, index) => (
                      <TableRow key={click.id} data-testid={`click-row-${index}`}>
                        <TableCell className="text-sm">
                          {format(new Date(click.clickedAt), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getButtonTypeIcon(click.buttonType)}
                            <span className="font-medium">{click.buttonLabel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs capitalize">
                            {click.buttonType}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {click.ipAddress || "-"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm" title={click.userAgent}>
                          {click.userAgent || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {clicks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No clicks recorded
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}