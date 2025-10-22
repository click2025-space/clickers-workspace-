import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, FolderOpen, CheckCircle2, TrendingUp, Calendar, Clock, FolderKanban, BarChart3 } from "lucide-react";
import { projectsApi, departmentsApi } from "@/lib/supabase-api";

export default function Dashboard() {
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.getAll,
  });

  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentsApi.getAll,
  });

  const stats = [
    {
      title: "Active Projects",
      value: projects?.length || 0,
      icon: FolderKanban,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Departments",
      value: departments?.length || 0,
      icon: BarChart3,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Team Members",
      value: departments?.reduce((acc, dept) => acc + dept.team_members.length, 0) || 0,
      icon: Users,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Avg. Progress",
      value: projects?.length ? `${Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)}%` : "0%",
      icon: TrendingUp,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  if (projectsLoading || departmentsLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-secondary rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-secondary rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Welcome to Clickers Workspace</h1>
        <p className="text-muted-foreground mt-1">Manage your teams, projects, and collaborate efficiently</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover-elevate" data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4" data-testid="text-section-title">Active Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <Card key={project.id} className="hover-elevate" data-testid={`card-project-${project.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg" data-testid={`text-project-name-${project.id}`}>{project.name}</CardTitle>
                      <CardDescription className="mt-1">{project.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" data-testid={`badge-department-${project.id}`}>{project.department}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold" data-testid={`text-progress-${project.id}`}>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" data-testid={`progress-bar-${project.id}`} />
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Team Members</p>
                    <div className="flex -space-x-2">
                      {project.team_members.slice(0, 4).map((member: string, idx: number) => (
                        <Avatar key={idx} className="border-2 border-card w-8 h-8">
                          <AvatarImage src="" alt={member} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-chart-2 text-white">
                            {member.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.team_members.length > 4 && (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-card bg-secondary text-xs font-medium">
                          +{project.team_members.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderKanban className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No projects yet. Start by creating your first project.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
