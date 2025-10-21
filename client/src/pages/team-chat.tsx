import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip } from "lucide-react";
import type { Member, Message } from "@shared/schema";

export default function TeamChat() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const { data: members, isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const currentUserId = "current-user";

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
              <h3 className="font-semibold" data-testid="text-sidebar-title">Team Members</h3>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-380px)]">
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
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages && messages.map((message) => {
                    const isSent = message.senderId === currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                        data-testid={`message-${message.id}`}
                      >
                        <div className={`flex items-end gap-2 max-w-[70%] ${isSent ? "flex-row-reverse" : "flex-row"}`}>
                          {!isSent && (
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src="" alt="User" />
                              <AvatarFallback className="text-xs bg-secondary">
                                {members?.find(m => m.id === message.senderId)?.name.split(' ').map(n => n[0]).join('') || "U"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="space-y-1">
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isSent
                                  ? "bg-gradient-to-r from-primary to-chart-2 text-white rounded-br-sm"
                                  : "bg-secondary rounded-bl-sm"
                              }`}
                            >
                              <p className="text-sm" data-testid={`text-message-content-${message.id}`}>{message.content}</p>
                            </div>
                            <p className={`text-xs text-muted-foreground ${isSent ? "text-right" : "text-left"}`}>
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
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1"
                      data-testid="input-message"
                    />
                    <Button className="bg-gradient-to-r from-primary to-chart-2" data-testid="button-send">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground" data-testid="text-empty-state">
                Select a team member to start chatting
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
