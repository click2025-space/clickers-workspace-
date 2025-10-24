import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Send, Smile, Paperclip, RefreshCw, File, Image, Download } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { messagesApi, profilesApi } from "@/lib/supabase-api";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { supabase } from "@/lib/supabase";

export default function TeamChat() {
  const [selectedMember, setSelectedMember] = useState<string | null>("global");
  const [messageInput, setMessageInput] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user, profile } = useSupabaseAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: profilesApi.getAll,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: messagesApi.getAll,
    refetchInterval: 1000, // Aggressive polling: refetch every 1 second
    refetchIntervalInBackground: true, // Keep refetching even when tab is not active
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
  });

  // Real-time subscription for messages
  useEffect(() => {
    console.log('🔄 Setting up real-time subscription for messages...');
    
    const channel = supabase
      .channel('messages-realtime', {
        config: {
          broadcast: { self: true },
          presence: { key: user?.id }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('📨 New message received via real-time:', payload);
          // Force immediate refetch of messages
          queryClient.refetchQueries({ queryKey: ["messages"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('📝 Message updated via real-time:', payload);
          queryClient.refetchQueries({ queryKey: ["messages"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('🗑️ Message deleted via real-time:', payload);
          queryClient.refetchQueries({ queryKey: ["messages"] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time messages');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription error');
        }
      });

    return () => {
      console.log('🔌 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string; content: string }) => {
      const timestamp = new Date().toISOString();
      return await messagesApi.create({
        sender_id: user?.id || "anonymous",
        channel: data.receiverId,
        content: data.content,
        timestamp,
      });
    },
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["messages"] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(["messages"]);

      // Optimistically update to the new value
      const optimisticMessage = {
        id: `temp-${Date.now()}`, // Temporary ID
        sender_id: user?.id || "anonymous",
        channel: newMessage.receiverId,
        content: newMessage.content,
        timestamp: new Date().toISOString(),
      };

      queryClient.setQueryData(["messages"], (old: any) => {
        return old ? [...old, optimisticMessage] : [optimisticMessage];
      });

      // Clear input immediately
      setMessageInput("");

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["messages"], context?.previousMessages);
      console.error("Failed to send message:", err);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedMember) return;
    sendMessageMutation.mutate({
      receiverId: selectedMember,
      content: messageInput.trim(),
    });
  };

  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setIsRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: ["messages"] });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Show loading for at least 500ms
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      console.log('📎 File selected:', file.name, file.type, file.size);
    }
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `chat-files/${fileName}`;
    
    console.log('📤 Uploading file:', fileName);
    
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, file);
    
    if (error) {
      console.error('❌ File upload error:', error);
      throw error;
    }
    
    console.log('✅ File uploaded successfully:', data.path);
    return data.path;
  };

  const handleSendFileMessage = async () => {
    if (!selectedFile || !selectedMember) return;
    
    setIsUploading(true);
    try {
      // Upload file to Supabase Storage
      const filePath = await handleFileUpload(selectedFile);
      
      // Get public URL for the file
      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);
      
      // Send message with file attachment
      const fileMessage = `📎 ${selectedFile.name}|${urlData.publicUrl}|${selectedFile.type}|${selectedFile.size}`;
      
      await sendMessageMutation.mutateAsync({
        receiverId: selectedMember,
        content: fileMessage,
      });
      
      // Clear selected file
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('❌ Failed to send file:', error);
      alert('Failed to send file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const isFileMessage = (content: string) => {
    return content.startsWith('📎 ') && content.includes('|');
  };

  const parseFileMessage = (content: string) => {
    if (!isFileMessage(content)) return null;
    
    const parts = content.substring(2).split('|'); // Remove '📎 ' prefix
    if (parts.length >= 4) {
      return {
        fileName: parts[0],
        fileUrl: parts[1],
        fileType: parts[2],
        fileSize: parseInt(parts[3])
      };
    }
    return null;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredMessages = messages?.filter((msg) => {
    if (selectedMember === "global") {
      return msg.channel === "global";
    }
    return (
      (msg.sender_id === user?.id && msg.channel === selectedMember) ||
      (msg.sender_id === selectedMember && msg.channel === user?.id)
    );
  }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) || [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

  if (profilesLoading || messagesLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse h-[calc(100vh-200px)] bg-secondary rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-page-title">Team Chat</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Communicate with your team members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 h-[calc(100vh-200px)] sm:h-[calc(100vh-280px)]">
        <Card className="lg:col-span-4 xl:col-span-3 h-full lg:h-auto">
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h3 className="font-semibold" data-testid="text-sidebar-title">Conversations</h3>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-380px)]">
              {/* Global Team Chat */}
              <div
                onClick={() => setSelectedMember("global")}
                className={`flex items-center gap-3 p-4 cursor-pointer hover-elevate ${
                  selectedMember === "global" ? "bg-secondary" : ""
                }`}
                data-testid="item-global-chat"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" data-testid="text-global-chat-name">Team Chat</p>
                  <p className="text-xs text-muted-foreground truncate">Everyone in the workspace</p>
                </div>
                <Badge variant="secondary" className="bg-chart-1/10 text-chart-1 text-xs">
                  {messages?.filter(m => m.channel === "global").length || 0}
                </Badge>
              </div>

            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8 xl:col-span-9 h-full">
          <CardContent className="p-0 flex flex-col h-full relative">
            {selectedMember ? (
              <>
                {/* Fixed Header */}
                <div className="p-4 border-b bg-background sticky top-0 z-10">
                  {selectedMember === "global" ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold" data-testid="text-chat-header-name">Team Chat</p>
                          <p className="text-xs text-muted-foreground" data-testid="text-chat-header-status">{profiles?.length || 0} members</p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleManualRefresh}
                        disabled={isRefreshing}
                        className="h-8 w-8"
                        data-testid="button-refresh-messages"
                      >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="" alt="Member" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-white">
                          {profiles?.find(p => p.user_id === selectedMember)?.name?.split(' ').map(n => n[0]).join('') || "M"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold" data-testid="text-chat-header-name">{profiles?.find(p => p.user_id === selectedMember)?.name}</p>
                        <p className="text-xs text-chart-3" data-testid="text-chat-header-status">Online</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scrollable Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                  {filteredMessages.map((message) => {
                    const isSent = message.sender_id === user?.id;
                    const sender = profiles?.find(p => p.user_id === message.sender_id);
                    const isGlobalChat = selectedMember === "global";
                    
                    // Get sender name from profile lookup
                    const displayName = sender?.name || (isSent ? (profile?.name || "You") : "Unknown User");
                    const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase() || "U";
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSent && !isGlobalChat ? "justify-end" : "justify-start"}`}
                        data-testid={`message-${message.id}`}
                      >
                        <div className={`flex items-end gap-2 max-w-[70%] ${isSent && !isGlobalChat ? "flex-row-reverse" : "flex-row"}`}>
                          {(!isSent || isGlobalChat) && (
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src="" alt="User" />
                              <AvatarFallback className={`text-xs ${isSent ? "bg-gradient-to-br from-primary to-chart-2 text-white" : "bg-secondary"}`}>
                                {isSent ? (profile?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || "You") : initials}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="space-y-1">
                            {isGlobalChat && (
                              <p className={`text-xs font-medium ${isSent ? "text-primary" : "text-muted-foreground"}`}>
                                {isSent ? (profile?.name || "You") : displayName}
                              </p>
                            )}
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isSent
                                  ? "bg-gradient-to-r from-primary to-chart-2 text-white rounded-br-sm"
                                  : "bg-secondary rounded-bl-sm"
                              }`}
                            >
                              {isFileMessage(message.content) ? (
                                (() => {
                                  const fileData = parseFileMessage(message.content);
                                  if (!fileData) return <p className="text-sm">{message.content}</p>;
                                  
                                  const isImage = fileData.fileType.startsWith('image/');
                                  
                                  return (
                                    <div className="space-y-2">
                                      {isImage ? (
                                        <div className="max-w-xs">
                                          <img 
                                            src={fileData.fileUrl} 
                                            alt={fileData.fileName}
                                            className="rounded-lg max-w-full h-auto cursor-pointer"
                                            onClick={() => window.open(fileData.fileUrl, '_blank')}
                                          />
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-3 p-3 bg-black/10 dark:bg-white/10 rounded-lg">
                                          <File className="w-8 h-8 flex-shrink-0" />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{fileData.fileName}</p>
                                            <p className="text-xs opacity-70">{formatFileSize(fileData.fileSize)}</p>
                                          </div>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => window.open(fileData.fileUrl, '_blank')}
                                            className="h-8 w-8 flex-shrink-0"
                                          >
                                            <Download className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()
                              ) : (
                                <p className="text-sm" data-testid={`text-message-content-${message.id}`}>{message.content}</p>
                              )}
                            </div>
                            <p className={`text-xs text-muted-foreground ${isSent && !isGlobalChat ? "text-right" : "text-left"}`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Auto-scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Fixed Input Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t bg-background/95 backdrop-blur-sm">
                  {/* File Preview */}
                  {selectedFile && (
                    <div className="mb-3 p-3 bg-secondary rounded-lg flex items-center gap-3">
                      <File className="w-6 h-6 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleSendFileMessage}
                        disabled={isUploading}
                        className="bg-gradient-to-r from-primary to-chart-2"
                      >
                        {isUploading ? 'Uploading...' : 'Send File'}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="h-8 w-8"
                      >
                        ×
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="hidden sm:flex" data-testid="button-emoji">
                      <Smile className="w-5 h-5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => fileInputRef.current?.click()}
                      className="hidden sm:flex" 
                      data-testid="button-attach"
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="*/*"
                    />
                    <Input
                      placeholder={selectedMember === "global" ? "Message the team..." : "Type a message..."}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 min-h-[44px]"
                      data-testid="input-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      className="bg-gradient-to-r from-primary to-chart-2 min-h-[44px] min-w-[44px]"
                      data-testid="button-send"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground" data-testid="text-empty-state">
                Select a conversation to start chatting
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
