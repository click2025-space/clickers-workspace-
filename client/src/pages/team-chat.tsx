import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Member, Message } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

export default function TeamChat() {
  const [selectedMember, setSelectedMember] = useState<string | null>("global");
  const [messageInput, setMessageInput] = useState("");
  const { toast } = useToast();
  const { user, profile } = useSupabaseAuth();

  const { data: members, isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string; content: string }) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return await apiRequest("POST", "/api/messages", {
        senderId: user?.id || "anonymous",
        senderName: profile?.name || user?.email?.split('@')[0] || "Anonymous",
        receiverId: data.receiverId,
        content: data.content,
        timestamp,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessageInput("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedMember) return;
    sendMessageMutation.mutate({
      receiverId: selectedMember,
      content: messageInput.trim(),
    });
  };

  const filteredMessages = messages?.filter((msg) => {
    if (selectedMember === "global") {
      return msg.receiverId === "global";
    }
    return (
      (msg.senderId === user?.id && msg.receiverId === selectedMember) ||
      (msg.senderId === selectedMember && msg.receiverId === user?.id)
    );
  }) || [];

  if (membersLoading || messagesLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse h-[calc(100vh-200px)] bg-secondary rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Team Chat</h1>
        <p className="text-muted-foreground mt-1">Communicate with your team members</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)]">
        <Card className="col-span-12 md:col-span-4 lg:col-span-3">
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
                  {messages?.filter(m => m.receiverId === "global").length || 0}
                </Badge>
              </div>

              {/* Divider */}
              <div className="px-4 py-2 border-b">
                <p className="text-xs font-medium text-muted-foreground">Direct Messages</p>
              </div>

              {/* Individual Team Members */}
              {members && members.map((member) => (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member.id)}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover-elevate ${
                    selectedMember === member.id ? "bg-secondary" : ""
                  }`}
                  data-testid={`item-member-${member.id}`}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={member.avatar || ""} alt={member.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                        member.status === "online"
                          ? "bg-chart-3"
                          : member.status === "away"
                          ? "bg-chart-4"
                          : "bg-muted"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" data-testid={`text-member-name-${member.id}`}>{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                  </div>
                  {member.status === "online" && (
                    <Badge variant="secondary" className="bg-chart-3/10 text-chart-3 text-xs">
                      Online
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-8 lg:col-span-9">
          <CardContent className="p-0 flex flex-col h-full">
            {selectedMember ? (
              <>
                <div className="p-4 border-b">
                  {selectedMember === "global" ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold" data-testid="text-chat-header-name">Team Chat</p>
                        <p className="text-xs text-muted-foreground" data-testid="text-chat-header-status">{members?.length || 0} members</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="" alt="Member" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-white">
                          {members?.find(m => m.id === selectedMember)?.name.split(' ').map(n => n[0]).join('') || "M"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold" data-testid="text-chat-header-name">{members?.find(m => m.id === selectedMember)?.name}</p>
                        <p className="text-xs text-chart-3" data-testid="text-chat-header-status">Online</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {filteredMessages.map((message) => {
                    const isSent = message.senderId === user?.id;
                    const sender = members?.find(m => m.id === message.senderId);
                    const isGlobalChat = selectedMember === "global";
                    
                    // Use senderName from message if available, otherwise fallback to member lookup
                    const displayName = message.senderName || sender?.name || "Unknown User";
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
                              <p className="text-sm" data-testid={`text-message-content-${message.id}`}>{message.content}</p>
                            </div>
                            <p className={`text-xs text-muted-foreground ${isSent && !isGlobalChat ? "text-right" : "text-left"}`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" data-testid="button-emoji">
                      <Smile className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="ghost" data-testid="button-attach">
                      <Paperclip className="w-5 h-5" />
                    </Button>
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
                      className="flex-1"
                      data-testid="input-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      className="bg-gradient-to-r from-primary to-chart-2"
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
