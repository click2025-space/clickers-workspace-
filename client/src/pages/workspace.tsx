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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Coffee,
  FileText,
  Database as DatabaseIcon,
  Upload,
  Plus,
  Edit3,
  Save,
  Trash2,
  Download,
  Clock,
  Tag,
  Search,
  Filter,
  StickyNote,
  FolderOpen,
  Settings
} from "lucide-react";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { workspaceNotesApi, workspaceFilesApi, workspaceDataApi, membersApi } from "@/lib/supabase-api";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import type { Database } from "@/lib/supabase";

type Member = Database['public']['Tables']['members']['Row'];
type WorkspaceNote = Database['public']['Tables']['workspace_notes']['Row'];
type WorkspaceFile = Database['public']['Tables']['workspace_files']['Row'];
type WorkspaceData = Database['public']['Tables']['workspace_data']['Row'];

export default function Workspace() {
  const [, params] = useRoute("/profile/:id");
  const { user, profile } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState("notes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingData, setIsAddingData] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", category: "general" });
  const [newData, setNewData] = useState({ key: "", value: "", dataType: "string", category: "general" });

  // Use current user's ID or the ID from params (for viewing other users' workspaces)
  const workspaceUserId = params?.id || user?.id;

  // For now, we'll use the current user's profile as the member data
  // In the future, you can implement fetching other users' profiles
  const member = profile;
  const memberLoading = false;

  const { data: notes = [], isLoading: notesLoading } = useQuery<WorkspaceNote[]>({
    queryKey: [`workspace-notes-${workspaceUserId}`],
    queryFn: () => workspaceNotesApi.getAll(workspaceUserId!),
    enabled: !!workspaceUserId,
  });

  const { data: files = [], isLoading: filesLoading } = useQuery<WorkspaceFile[]>({
    queryKey: [`workspace-files-${workspaceUserId}`],
    queryFn: () => workspaceFilesApi.getAll(workspaceUserId!),
    enabled: !!workspaceUserId,
  });

  const { data: workspaceData = [], isLoading: dataLoading } = useQuery<WorkspaceData[]>({
    queryKey: [`workspace-data-${workspaceUserId}`],
    queryFn: () => workspaceDataApi.getAll(workspaceUserId!),
    enabled: !!workspaceUserId,
  });

  const createNoteMutation = useMutation({
    mutationFn: async (note: any) => {
      return await workspaceNotesApi.create({ ...note, member_id: workspaceUserId! });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`workspace-notes-${workspaceUserId}`] });
      setIsAddingNote(false);
      setNewNote({ title: "", content: "", category: "general" });
    },
  });

  const createDataMutation = useMutation({
    mutationFn: async (data: any) => {
      return await workspaceDataApi.create({ ...data, member_id: workspaceUserId! });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`workspace-data-${workspaceUserId}`] });
      setIsAddingData(false);
      setNewData({ key: "", value: "", dataType: "string", category: "general" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await workspaceNotesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`workspace-notes-${workspaceUserId}`] });
    },
  });

  const deleteDataMutation = useMutation({
    mutationFn: async (id: string) => {
      return await workspaceDataApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`workspace-data-${workspaceUserId}`] });
    },
  });

  const handleCreateNote = () => {
    if (newNote.title && newNote.content) {
      createNoteMutation.mutate(newNote);
    }
  };

  const handleCreateData = () => {
    if (newData.key && newData.value) {
      createDataMutation.mutate(newData);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredData = workspaceData.filter(data => {
    const matchesSearch = data.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         data.value.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || data.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (memberLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cafe-50 to-cafe-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-cafe-200 rounded-xl"></div>
            <div className="h-96 bg-cafe-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cafe-50 to-cafe-100 p-8">
        <div className="max-w-7xl mx-auto text-center">
          <Coffee className="w-16 h-16 text-cafe-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-cafe-800 mb-2">Workspace Not Found</h1>
          <p className="text-cafe-600">The workspace you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cafe-50 to-cafe-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card className="border-cafe-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 border-4 border-cafe-300">
                <AvatarImage src={member?.avatar || undefined} alt={member?.name || 'User'} />
                <AvatarFallback className="text-xl font-bold bg-cafe-300 text-cafe-800">
                  {getInitials(member?.name || 'User')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-cafe-800 mb-2">{member?.name || 'User'}'s Workspace</h1>
                <p className="text-cafe-600 mb-3">{member?.role || 'Role'} • {member?.department || 'Department'}</p>
                <div className="flex items-center gap-4">
                  <Badge className="bg-cafe-200 text-cafe-800">
                    <Coffee className="w-3 h-3 mr-1" />
                    Personal Workspace
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right text-sm text-cafe-600">
                  <p>{notes.length} Notes</p>
                  <p>{files.length} Files</p>
                  <p>{workspaceData.length} Data Items</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter Bar */}
        <Card className="border-cafe-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cafe-500" />
                <Input
                  placeholder="Search notes, files, and data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-cafe-300 bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-cafe-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-cafe-300 rounded-md bg-white text-cafe-700"
                >
                  <option value="all">All Categories</option>
                  <option value="general">General</option>
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="projects">Projects</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workspace Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-cafe-200">
            <TabsTrigger value="notes" className="flex items-center gap-2 data-[state=active]:bg-cafe-600 data-[state=active]:text-white">
              <StickyNote className="w-4 h-4" />
              Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2 data-[state=active]:bg-cafe-600 data-[state=active]:text-white">
              <FolderOpen className="w-4 h-4" />
              Files ({files.length})
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2 data-[state=active]:bg-cafe-600 data-[state=active]:text-white">
              <DatabaseIcon className="w-4 h-4" />
              Data ({workspaceData.length})
            </TabsTrigger>
          </TabsList>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-cafe-800">Personal Notes</h2>
              <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
                <DialogTrigger asChild>
                  <Button className="bg-cafe-600 hover:bg-cafe-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Note</DialogTitle>
                    <DialogDescription>
                      Add a new note to your personal workspace
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="note-title">Title</Label>
                      <Input
                        id="note-title"
                        value={newNote.title}
                        onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                        placeholder="Note title..."
                        className="border-cafe-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="note-category">Category</Label>
                      <select
                        id="note-category"
                        value={newNote.category}
                        onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                        className="w-full px-3 py-2 border border-cafe-300 rounded-md bg-white"
                      >
                        <option value="general">General</option>
                        <option value="work">Work</option>
                        <option value="personal">Personal</option>
                        <option value="projects">Projects</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="note-content">Content</Label>
                      <Textarea
                        id="note-content"
                        value={newNote.content}
                        onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                        placeholder="Write your note here..."
                        rows={8}
                        className="border-cafe-300"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCreateNote}
                        className="bg-cafe-600 hover:bg-cafe-700 text-white"
                        disabled={createNoteMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Note
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddingNote(false)}
                        className="border-cafe-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <Card key={note.id} className="border-cafe-200 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg text-cafe-800 line-clamp-2">{note.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-cafe-200 text-cafe-700 text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {note.category}
                      </Badge>
                      <span className="text-xs text-cafe-500">{formatDate(note.created_at)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-cafe-700 text-sm line-clamp-4">{note.content}</p>
                  </CardContent>
                </Card>
              ))}
              
              {filteredNotes.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <FileText className="w-12 h-12 text-cafe-400 mx-auto mb-4" />
                  <p className="text-cafe-600">
                    {searchQuery || selectedCategory !== "all" 
                      ? "No notes match your search criteria" 
                      : "No notes yet. Create your first note to get started!"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-cafe-800">File Storage</h2>
              <Button className="bg-cafe-600 hover:bg-cafe-700 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {files.map((file) => (
                <Card key={file.id} className="border-cafe-200 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <FolderOpen className="w-8 h-8 text-cafe-600" />
                      <Button variant="ghost" size="sm" className="text-cafe-600 hover:text-cafe-700">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="font-medium text-cafe-800 truncate mb-2">{file.file_name}</h3>
                    <div className="space-y-1 text-xs text-cafe-600">
                      <p>Type: {file.file_type}</p>
                      <p>Size: {(file.file_size / 1024).toFixed(1)} KB</p>
                      <p>Uploaded: {formatDate(file.uploaded_at)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {files.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Upload className="w-12 h-12 text-cafe-400 mx-auto mb-4" />
                  <p className="text-cafe-600">No files uploaded yet. Upload your first file to get started!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-cafe-800">Data Storage</h2>
              <Dialog open={isAddingData} onOpenChange={setIsAddingData}>
                <DialogTrigger asChild>
                  <Button className="bg-cafe-600 hover:bg-cafe-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Data Item</DialogTitle>
                    <DialogDescription>
                      Store key-value data in your workspace
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="data-key">Key</Label>
                      <Input
                        id="data-key"
                        value={newData.key}
                        onChange={(e) => setNewData({...newData, key: e.target.value})}
                        placeholder="Data key..."
                        className="border-cafe-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="data-value">Value</Label>
                      <Textarea
                        id="data-value"
                        value={newData.value}
                        onChange={(e) => setNewData({...newData, value: e.target.value})}
                        placeholder="Data value..."
                        rows={4}
                        className="border-cafe-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="data-type">Type</Label>
                        <select
                          id="data-type"
                          value={newData.dataType}
                          onChange={(e) => setNewData({...newData, dataType: e.target.value})}
                          className="w-full px-3 py-2 border border-cafe-300 rounded-md bg-white"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="json">JSON</option>
                          <option value="text">Text</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="data-category">Category</Label>
                        <select
                          id="data-category"
                          value={newData.category}
                          onChange={(e) => setNewData({...newData, category: e.target.value})}
                          className="w-full px-3 py-2 border border-cafe-300 rounded-md bg-white"
                        >
                          <option value="general">General</option>
                          <option value="work">Work</option>
                          <option value="personal">Personal</option>
                          <option value="projects">Projects</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCreateData}
                        className="bg-cafe-600 hover:bg-cafe-700 text-white"
                        disabled={createDataMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Data
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddingData(false)}
                        className="border-cafe-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredData.map((data) => (
                <Card key={data.id} className="border-cafe-200 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg text-cafe-800">{data.key}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDataMutation.mutate(data.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-cafe-200 text-cafe-700 text-xs">{data.data_type}</Badge>
                      <Badge className="bg-cafe-100 text-cafe-600 text-xs">{data.category}</Badge>
                      <span className="text-xs text-cafe-500">{formatDate(data.created_at)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-cafe-50 p-3 rounded-md">
                      <pre className="text-sm text-cafe-700 whitespace-pre-wrap break-words">{data.value}</pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredData.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <DatabaseIcon className="w-12 h-12 text-cafe-400 mx-auto mb-4" />
                  <p className="text-cafe-600">
                    {searchQuery || selectedCategory !== "all" 
                      ? "No data matches your search criteria" 
                      : "No data stored yet. Add your first data item to get started!"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
