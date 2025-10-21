import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { Settings as SettingsIcon, Save, Moon, Sun } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Settings } from "@shared/schema";
import { useForm } from "react-hook-form";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      workspaceName: "Clickers Workspace",
    },
  });

  // Reset form when settings data loads
  React.useEffect(() => {
    if (settings) {
      reset({
        workspaceName: settings.workspaceName,
      });
    }
  }, [settings, reset]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  const onSubmit = (data: any) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary rounded w-64"></div>
          <div className="space-y-4 max-w-2xl">
            <div className="h-64 bg-secondary rounded-lg"></div>
            <div className="h-64 bg-secondary rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your workspace preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              General Settings
            </CardTitle>
            <CardDescription>Update your workspace configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="workspaceName">Workspace Name</Label>
                <Input
                  id="workspaceName"
                  {...register("workspaceName")}
                  placeholder="Clickers Workspace"
                  data-testid="input-workspace-name"
                />
                <p className="text-sm text-muted-foreground">
                  This name will be displayed across your workspace
                </p>
              </div>
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-chart-2"
                disabled={updateSettingsMutation.isPending}
                data-testid="button-save-general"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize how Clickers Workspace looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme-toggle">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                data-testid="switch-theme"
              />
            </div>

            <div className="pt-4 border-t space-y-3">
              <Label data-testid="label-theme-preview">Theme Preview</Label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setTheme("light")}
                  className={`p-4 rounded-lg border-2 cursor-pointer hover-elevate ${
                    theme === "light" ? "border-primary" : "border-border"
                  }`}
                  data-testid="button-theme-light"
                >
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                    <div className="flex gap-1 mt-3">
                      <div className="h-6 w-6 bg-purple-500 rounded"></div>
                      <div className="h-6 w-6 bg-blue-500 rounded"></div>
                    </div>
                  </div>
                  <p className="text-xs text-center mt-3 font-medium">Light</p>
                </div>

                <div
                  onClick={() => setTheme("dark")}
                  className={`p-4 rounded-lg border-2 cursor-pointer hover-elevate bg-gray-900 ${
                    theme === "dark" ? "border-primary" : "border-border"
                  }`}
                  data-testid="button-theme-dark"
                >
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                    <div className="flex gap-1 mt-3">
                      <div className="h-6 w-6 bg-purple-500 rounded"></div>
                      <div className="h-6 w-6 bg-blue-500 rounded"></div>
                    </div>
                  </div>
                  <p className="text-xs text-center mt-3 font-medium text-white">Dark</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Manage workspace departments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Design", "Development", "Marketing", "Admin", "Sales"].map((dept) => (
              <div key={dept} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50" data-testid={`item-department-${dept.toLowerCase()}`}>
                <span className="font-medium" data-testid={`text-department-${dept.toLowerCase()}`}>{dept}</span>
                <Button variant="ghost" size="sm" data-testid={`button-edit-${dept.toLowerCase()}`}>
                  Edit
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full" data-testid="button-add-department">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
