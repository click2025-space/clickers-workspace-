import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, BarChart3, Building2 } from "lucide-react";
import type { Department } from "@shared/schema";

export default function VirtualOffices() {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-secondary rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedDepartment) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedDepartment(null)}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold" data-testid="text-department-name">{selectedDepartment.name}</h1>
            <p className="text-muted-foreground mt-1" data-testid="text-department-description">{selectedDepartment.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members ({selectedDepartment.teamMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedDepartment.teamMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover-elevate" data-testid={`item-team-member-${idx}`}>
                    <Avatar>
                      <AvatarImage src="" alt={member} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-white">
                        {member.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium" data-testid={`text-member-${idx}`}>{member}</p>
                      <p className="text-sm text-muted-foreground">Team Member</p>
                    </div>
                    <Badge variant="secondary" className="bg-chart-3/10 text-chart-3" data-testid={`badge-status-${idx}`}>Online</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Task Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50" data-testid="stat-active-tasks">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Tasks</p>
                    <p className="text-2xl font-bold mt-1" data-testid="text-active-tasks">12</p>
                  </div>
                  <div className="p-3 rounded-lg bg-chart-2/10">
                    <BarChart3 className="w-6 h-6 text-chart-2" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50" data-testid="stat-completed-tasks">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold mt-1" data-testid="text-completed-tasks">28</p>
                  </div>
                  <div className="p-3 rounded-lg bg-chart-3/10">
                    <BarChart3 className="w-6 h-6 text-chart-3" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50" data-testid="stat-in-progress-tasks">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold mt-1" data-testid="text-in-progress-tasks">8</p>
                  </div>
                  <div className="p-3 rounded-lg bg-chart-1/10">
                    <BarChart3 className="w-6 h-6 text-chart-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Virtual Offices</h1>
        <p className="text-muted-foreground mt-1">Explore departments and their teams</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments && departments.length > 0 ? (
          departments.map((department) => (
            <Card
              key={department.id}
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedDepartment(department)}
              data-testid={`card-department-${department.id}`}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-chart-2">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl" data-testid={`text-department-${department.id}`}>{department.name}</CardTitle>
                    <CardDescription className="mt-1">{department.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{department.teamMembers.length} members</span>
                  </div>
                  <div className="flex -space-x-2">
                    {department.teamMembers.slice(0, 5).map((member, idx) => (
                      <Avatar key={idx} className="border-2 border-card w-8 h-8">
                        <AvatarImage src="" alt={member} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-chart-2 text-white">
                          {member.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {department.teamMembers.length > 5 && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-card bg-secondary text-xs font-medium">
                        +{department.teamMembers.length - 5}
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
              <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No departments found. Create your first department to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
