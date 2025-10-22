import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Send, Smile, Paperclip } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { messagesApi, membersApi } from "@/lib/supabase-api";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { supabase } from "@/lib/supabase";

export default function TeamChat() {
  const [selectedMember, setSelectedMember] = useState<string | null>("global");
  const [messageInput, setMessageInput] = useState("");
  const { user, profile } = useSupabaseAuth();

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["members"],
    queryFn: membersApi.getAll,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: messagesApi.getAll,
  });

  // Real-time subscription for messages
  useEffect(() => {
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Real-time message update:', payload);
          // Invalidate and refetch messages when there's a change
          queryClient.invalidateQueries({ queryKey: ["messages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
    onSuccess: () => {
      // No need to invalidate queries since real-time subscription will handle it
      setMessageInput("");
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
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
      return msg.channel === "global";
    }
    return (
      (msg.sender_id === user?.id && msg.channel === selectedMember) ||
      (msg.sender_id === selectedMember && msg.channel === user?.id)
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

        <Card className="lg:col-span-8 xl:col-span-9 h-full">
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
                    const isSent = message.sender_id === user?.id;
                    const sender = members?.find(m => m.id === message.sender_id);
                    const isGlobalChat = selectedMember === "global";
                    
                    // Get sender name from member lookup or profile
                    const displayName = sender?.name || "Unknown User";
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

                <div className="p-3 sm:p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="hidden sm:flex" data-testid="button-emoji">
                      <Smile className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="hidden sm:flex" data-testid="button-attach">
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
