import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { TodoItem } from "@/types";

export default function AITodoCalendar() {
  const { data: todos, isLoading } = useQuery({
    queryKey: ["/api/mock/todos"],
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const todoItems = todos?.filter((item: TodoItem) => item.status === 'todo') || [];
  const inProgressItems = todos?.filter((item: TodoItem) => item.status === 'in-progress') || [];
  const doneItems = todos?.filter((item: TodoItem) => item.status === 'done') || [];

  const columns = [
    { title: "To Do", items: todoItems, color: "bg-yellow-500", count: todoItems.length },
    { title: "In Progress", items: inProgressItems, color: "bg-blue-500", count: inProgressItems.length },
    { title: "Done", items: doneItems, color: "bg-emerald-500", count: doneItems.length },
  ];

  return (
    <Card className="h-full bg-card border-border">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-400" />
            </div>
            <CardTitle className="text-lg font-semibold">AI To-Do & Calendar</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" className="text-xs">
              Board
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              Calendar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-3 gap-4">
          {columns.map((column, index) => (
            <div key={index} className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center">
                <div className={`w-2 h-2 ${column.color} rounded-full mr-2`}></div>
                {column.title}
                <span className="ml-auto text-xs text-muted-foreground">{column.count}</span>
              </h4>
              <div className="space-y-2">
                {column.items.slice(0, 2).map((item: TodoItem) => (
                  <div
                    key={item.id}
                    className={`bg-muted p-3 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors ${item.status === 'done' ? 'opacity-75' : ''
                      }`}
                  >
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.dueDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {new Date(item.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                    {item.status === 'in-progress' && (
                      <p className="text-xs text-muted-foreground mt-1">In progress</p>
                    )}
                    {item.status === 'done' && (
                      <p className="text-xs text-muted-foreground mt-1">Completed</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
