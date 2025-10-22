import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Coffee, 
  User, 
  Briefcase, 
  Building, 
  Phone, 
  MapPin, 
  Plus, 
  X, 
  Loader2,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { profileSetupSchema, type ProfileSetupData } from "@shared/schema";

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const { setupProfile, user } = useSupabaseAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProfileSetupData>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      skills: [],
    },
  });

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      setValue("skills", updatedSkills);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    setValue("skills", updatedSkills);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const onSubmit = async (data: ProfileSetupData) => {
    try {
      setError("");
      await setupProfile({ ...data, skills });
      setLocation("/"); // Redirect to dashboard
    } catch (err: any) {
      setError(err.message || "Profile setup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cafe-50 to-cafe-100 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-cafe-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Coffee className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-cafe-800 mb-2">Welcome to Clickers!</h1>
          <p className="text-cafe-600 text-lg">Let's set up your profile to get started</p>
          {user && (
            <p className="text-sm text-cafe-500 mt-2">Signed in as {user.email}</p>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-cafe-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-sm text-cafe-600">Account Created</span>
          </div>
          <div className="w-12 h-0.5 bg-cafe-300"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-cafe-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">2</span>
            </div>
            <span className="ml-2 text-sm text-cafe-800 font-medium">Profile Setup</span>
          </div>
          <div className="w-12 h-0.5 bg-cafe-200"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-cafe-200 rounded-full flex items-center justify-center">
              <span className="text-cafe-500 text-sm font-bold">3</span>
            </div>
            <span className="ml-2 text-sm text-cafe-500">Complete</span>
          </div>
        </div>

        {/* Profile Setup Form */}
        <Card className="border-cafe-200 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-cafe-800 flex items-center justify-center gap-2">
              <User className="w-6 h-6" />
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-cafe-600">
              Tell us about yourself to personalize your workspace experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cafe-800 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-cafe-700">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      className="border-cafe-300 focus:border-cafe-500 focus:ring-cafe-500"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-cafe-700">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="Enter your phone number"
                      className="border-cafe-300 focus:border-cafe-500 focus:ring-cafe-500"
                      {...register("phone")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-cafe-700">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                    className="border-cafe-300 focus:border-cafe-500 focus:ring-cafe-500"
                    {...register("bio")}
                  />
                </div>
              </div>

              {/* Work Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cafe-800 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Work Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-cafe-700">Job Title *</Label>
                    <Input
                      id="role"
                      placeholder="e.g. Software Developer"
                      className="border-cafe-300 focus:border-cafe-500 focus:ring-cafe-500"
                      {...register("role")}
                    />
                    {errors.role && (
                      <p className="text-sm text-red-600">{errors.role.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-cafe-700">Department *</Label>
                    <select
                      id="department"
                      className="w-full px-3 py-2 border border-cafe-300 rounded-md bg-white focus:border-cafe-500 focus:ring-cafe-500"
                      {...register("department")}
                    >
                      <option value="">Select department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Product">Product</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.department && (
                      <p className="text-sm text-red-600">{errors.department.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-cafe-700">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cafe-500" />
                    <Input
                      id="location"
                      placeholder="e.g. San Francisco, CA"
                      className="border-cafe-300 focus:border-cafe-500 focus:ring-cafe-500 pl-10"
                      {...register("location")}
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cafe-800">Skills & Expertise</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="border-cafe-300 focus:border-cafe-500 focus:ring-cafe-500"
                    />
                    <Button
                      type="button"
                      onClick={addSkill}
                      className="bg-cafe-600 hover:bg-cafe-700 text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          className="bg-cafe-200 text-cafe-800 hover:bg-cafe-300 pr-1"
                        >
                          {skill}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-1 h-auto p-0 hover:bg-transparent"
                            onClick={() => removeSkill(skill)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1 bg-cafe-600 hover:bg-cafe-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-cafe-500">
          <p>You can always update your profile later in settings</p>
        </div>
      </div>
    </div>
  );
}
