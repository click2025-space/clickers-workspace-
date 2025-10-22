import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Mail, Users as UsersIcon, Search, User } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import type { Member } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMemberSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function Members() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const form = useForm({
    resolver: zodResolver(insertMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      department: "",
      avatar: "",
      status: "online",
    },
  });

  const createMemberMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/members", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      setDialogOpen(false);
      form.reset();
    },
  });

  const filteredMembers = members?.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-64 bg-secondary rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Team Members</h1>
          <p className="text-muted-foreground mt-1">Manage your workspace team</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-chart-2" data-testid="button-add-member">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-add-member">
            <DialogHeader>
              <DialogTitle data-testid="text-dialog-title">Add New Member</DialogTitle>
              <DialogDescription>
                Add a new team member to your workspace
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMemberMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@clickers.com" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Designer" {...field} data-testid="input-role" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-department">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Development">Development</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-chart-2"
                  disabled={createMemberMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMemberMutation.isPending ? "Adding..." : "Add Member"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredMembers && filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <Card key={member.id} className="hover-elevate" data-testid={`card-member-${member.id}`}>
              <CardHeader className="text-center pb-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={member.avatar || ""} alt={member.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-white text-xl">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${
                        member.status === "online"
                          ? "bg-chart-3"
                          : member.status === "away"
                          ? "bg-chart-4"
                          : "bg-muted"
                      }`}
                    />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg" data-testid={`text-name-${member.id}`}>{member.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="secondary" className="w-full justify-center" data-testid={`badge-department-${member.id}`}>
                  {member.department}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate" data-testid={`text-email-${member.id}`}>{member.email}</span>
                </div>
                <Link href={`/profile/${member.id}`}>
                  <Button className="w-full mt-3 bg-cafe-600 hover:bg-cafe-700 text-white" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Open Workspace
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UsersIcon className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No members found matching your search" : "No members yet. Add your first team member."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
