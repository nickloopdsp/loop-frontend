import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";

export default function TrendTracker() {
  const { data: trends, isLoading } = useQuery({
    queryKey: ["/api/mock/trending"],
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const gradients = [
    "from-pink-500 to-orange-500",
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-indigo-500",
    "from-green-500 to-teal-500",
    "from-red-500 to-pink-500",
  ];

  return (
    <Card className="h-full bg-card border-border">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <CardTitle className="text-lg font-semibold">Trending Now</CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          {trends?.slice(0, 3).map((item: any, index: number) => (
            <div 
              key={item.rank}
              className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${gradients[index]} rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">#{item.rank}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">+{item.mentions} mentions today</p>
              </div>
              <div className="text-emerald-400 text-xs">↗ {item.growth}%</div>
            </div>
          ))}
        </div>
        
        <Button 
          variant="secondary" 
          className="w-full mt-4"
        >
          View All Trends
        </Button>
      </CardContent>
    </Card>
  );
}
