import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Coffee,
  Briefcase,
  Clock,
  Star
} from "lucide-react";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Member } from "@shared/schema";

export default function Profile() {
  const [, params] = useRoute("/profile/:id");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Member>>({});

  const { data: member, isLoading } = useQuery<Member>({
    queryKey: [`/api/members/${params?.id}`],
    enabled: !!params?.id,
  });

  const updateMemberMutation = useMutation({
    mutationFn: async (data: Partial<Member>) => {
      return await apiRequest("PATCH", `/api/members/${params?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/members/${params?.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      setIsEditing(false);
      setEditForm({});
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      name: member?.name,
      email: member?.email,
      role: member?.role,
      department: member?.department,
    });
  };

  const handleSave = () => {
    updateMemberMutation.mutate(editForm);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cafe-50 to-cafe-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-cafe-200 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-96 bg-cafe-200 rounded-xl"></div>
              <div className="h-96 bg-cafe-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cafe-50 to-cafe-100 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Coffee className="w-16 h-16 text-cafe-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-cafe-800 mb-2">Member Not Found</h1>
          <p className="text-cafe-600">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cafe-50 to-cafe-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Card */}
        <Card className="overflow-hidden border-cafe-200 shadow-lg">
          <div className="h-32 bg-gradient-to-r from-cafe-400 via-cafe-500 to-cafe-600"></div>
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src={member.avatar || undefined} alt={member.name} />
                  <AvatarFallback className="text-2xl font-bold bg-cafe-300 text-cafe-800">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${getStatusColor(member.status)} rounded-full border-4 border-white`}></div>
              </div>
              
              <div className="flex-1 space-y-2">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="text-2xl font-bold bg-white border-cafe-300"
                      placeholder="Full Name"
                    />
                    <Input
                      value={editForm.role || ''}
                      onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                      className="bg-white border-cafe-300"
                      placeholder="Job Title"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-cafe-800">{member.name}</h1>
                    <p className="text-xl text-cafe-600">{member.role}</p>
                  </>
                )}
                
                <div className="flex items-center gap-3">
                  <Badge className="bg-cafe-200 text-cafe-800 hover:bg-cafe-300">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {isEditing ? (
                      <Input
                        value={editForm.department || ''}
                        onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                        className="h-6 text-xs bg-transparent border-none p-0 w-20"
                        placeholder="Department"
                      />
                    ) : (
                      member.department
                    )}
                  </Badge>
                  <Badge className={`${member.status === 'online' ? 'bg-green-100 text-green-800' : 
                    member.status === 'away' ? 'bg-yellow-100 text-yellow-800' : 
                    member.status === 'busy' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                    <Clock className="w-3 h-3 mr-1" />
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button 
                      onClick={handleSave} 
                      className="bg-cafe-600 hover:bg-cafe-700 text-white"
                      disabled={updateMemberMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      onClick={handleCancel} 
                      variant="outline" 
                      className="border-cafe-300 text-cafe-700 hover:bg-cafe-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleEdit} 
                    className="bg-cafe-600 hover:bg-cafe-700 text-white"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <Card className="border-cafe-200 shadow-lg">
            <CardHeader className="bg-cafe-100">
              <CardTitle className="text-cafe-800 flex items-center gap-2">
                <Coffee className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cafe-200 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-cafe-700" />
                  </div>
                  <div>
                    <Label className="text-sm text-cafe-600">Email</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="mt-1 border-cafe-300"
                        placeholder="Email address"
                      />
                    ) : (
                      <p className="font-medium text-cafe-800">{member.email}</p>
                    )}
                  </div>
                </div>

                <Separator className="bg-cafe-200" />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cafe-200 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-cafe-700" />
                  </div>
                  <div>
                    <Label className="text-sm text-cafe-600">Phone</Label>
                    <p className="font-medium text-cafe-800">+1 (555) 123-4567</p>
                  </div>
                </div>

                <Separator className="bg-cafe-200" />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cafe-200 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-cafe-700" />
                  </div>
                  <div>
                    <Label className="text-sm text-cafe-600">Location</Label>
                    <p className="font-medium text-cafe-800">San Francisco, CA</p>
                  </div>
                </div>

                <Separator className="bg-cafe-200" />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cafe-200 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-cafe-700" />
                  </div>
                  <div>
                    <Label className="text-sm text-cafe-600">Joined</Label>
                    <p className="font-medium text-cafe-800">January 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About & Skills */}
          <Card className="border-cafe-200 shadow-lg">
            <CardHeader className="bg-cafe-100">
              <CardTitle className="text-cafe-800 flex items-center gap-2">
                <Star className="w-5 h-5" />
                About & Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <Label className="text-sm text-cafe-600 mb-2 block">Bio</Label>
                <Textarea
                  className="border-cafe-300 bg-cafe-50 text-cafe-800 resize-none"
                  rows={4}
                  placeholder="Tell us about yourself..."
                  defaultValue="Passionate professional with expertise in modern web technologies. Love working with teams to create amazing user experiences and solve complex problems."
                  readOnly={!isEditing}
                />
              </div>

              <Separator className="bg-cafe-200" />

              <div>
                <Label className="text-sm text-cafe-600 mb-3 block">Skills & Expertise</Label>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Node.js', 'Design Systems', 'Team Leadership', 'Project Management'].map((skill) => (
                    <Badge key={skill} className="bg-cafe-300 text-cafe-800 hover:bg-cafe-400">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className="bg-cafe-200" />

              <div>
                <Label className="text-sm text-cafe-600 mb-3 block">Recent Activity</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-cafe-500 rounded-full"></div>
                    <span className="text-cafe-700">Completed "Website Redesign" project</span>
                    <span className="text-cafe-500 ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-cafe-400 rounded-full"></div>
                    <span className="text-cafe-700">Updated team documentation</span>
                    <span className="text-cafe-500 ml-auto">1 day ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-cafe-300 rounded-full"></div>
                    <span className="text-cafe-700">Joined "Mobile App Development" project</span>
                    <span className="text-cafe-500 ml-auto">3 days ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
