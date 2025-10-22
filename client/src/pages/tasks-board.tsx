import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, User, Calendar, CheckCircle2, Plus, GripVertical } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { tasksApi } from "@/lib/supabase-api";
import type { Database } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Task = Database['public']['Tables']['tasks']['Row'];

const columns = [
  { id: "todo", title: "To Do", color: "text-muted-foreground" },
  { id: "in-progress", title: "In Progress", color: "text-chart-2" },
  { id: "done", title: "Done", color: "text-chart-3" },
];

export default function TasksBoard() {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: tasksApi.getAll,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await tasksApi.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: string) => {
    if (draggedTask && draggedTask.status !== status) {
      updateTaskMutation.mutate({ id: draggedTask.id, status });
    }
    setDraggedTask(null);
  };

  const getTasksByStatus = (status: string) => {
    return tasks?.filter((task) => task.status === status) || [];
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-secondary rounded-lg"></div>
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
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Tasks Board</h1>
          <p className="text-muted-foreground mt-1">Manage and track your team's tasks</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-chart-2" data-testid="button-add-task">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <div
              key={column.id}
              className="space-y-4"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-semibold ${column.color}`} data-testid={`text-column-${column.id}`}>
                  {column.title}
                </h2>
                <Badge variant="secondary" data-testid={`badge-count-${column.id}`}>{columnTasks.length}</Badge>
              </div>

              <div className="space-y-3 min-h-[400px] p-4 rounded-lg bg-secondary/30" data-testid={`column-container-${column.id}`}>
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className="cursor-move hover-elevate"
                    data-testid={`card-task-${task.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <CardTitle className="text-base flex-1" data-testid={`text-task-title-${task.id}`}>
                          {task.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {task.description && (
                        <p className="text-sm text-muted-foreground" data-testid={`text-task-description-${task.id}`}>{task.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between gap-2">
                        {task.assigned_to && (
                          <div className="flex items-center gap-2" data-testid={`assignee-${task.id}`}>
                            <Avatar className="w-6 h-6">
                              <AvatarImage src="" alt={task.assigned_to} />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-chart-2 text-white">
                                {task.assigned_to.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground" data-testid={`text-assignee-${task.id}`}>{task.assigned_to}</span>
                          </div>
                        )}
                        
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`text-due-date-${task.id}`}>
                            <Calendar className="w-3 h-3" />
                            <span>{task.due_date}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {columnTasks.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                    No tasks in this column
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
