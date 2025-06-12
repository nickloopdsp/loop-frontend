import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Zap, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const growthActions = [
  {
    id: 1,
    title: "Increase TikTok Posting Frequency",
    description: "Post 3-4 short-form videos per week to capitalize on your 8.7% engagement rate",
    priority: "high",
    category: "Social Media",
    impact: "High",
    effort: "Medium",
    timeline: "2 weeks",
    status: "pending",
    aiInsight: "Your TikTok engagement is significantly higher than other platforms. Leverage this momentum."
  },
  {
    id: 2,
    title: "Target Spotify Editorial Playlists",
    description: "Submit your next release to mood-based playlists matching your indie-pop style",
    priority: "high",
    category: "Streaming",
    impact: "High",
    effort: "Low",
    timeline: "1 week",
    status: "in-progress",
    aiInsight: "Your streaming growth shows playlist potential with 45K monthly listeners."
  },
  {
    id: 3,
    title: "Collaborate with Similar Artists",
    description: "Reach out to artists with 50K-100K followers in the indie-pop genre",
    priority: "medium",
    category: "Networking",
    impact: "Medium",
    effort: "High",
    timeline: "4 weeks",
    status: "pending",
    aiInsight: "Cross-pollination with similar audiences could boost discovery by 15-25%."
  },
  {
    id: 4,
    title: "Optimize Instagram Story Engagement",
    description: "Use more interactive stickers and behind-the-scenes content",
    priority: "low",
    category: "Social Media",
    impact: "Medium",
    effort: "Low",
    timeline: "1 week",
    status: "completed",
    aiInsight: "Story completion rates are 30% below industry average for your follower count."
  }
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'in-progress': return <Clock className="w-4 h-4 text-blue-600" />;
    case 'pending': return <AlertCircle className="w-4 h-4 text-gray-400" />;
    default: return null;
  }
};

export default function GrowthPlanWidget() {
  const completedActions = growthActions.filter(action => action.status === 'completed').length;
  const totalActions = growthActions.length;
  const progressPercentage = (completedActions / totalActions) * 100;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          AI Growth Plan
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{completedActions}/{totalActions} completed</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            AI Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {growthActions.map((action) => (
          <div key={action.id} className="p-4 rounded-lg border bg-card space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(action.status)}
                  <h4 className="font-semibold text-sm">{action.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{action.description}</p>
              </div>
              <Badge className={getPriorityColor(action.priority)} variant="outline">
                {action.priority}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="bg-muted px-2 py-1 rounded">{action.category}</span>
                <span>Impact: <strong>{action.impact}</strong></span>
                <span>Effort: <strong>{action.effort}</strong></span>
                <span>Timeline: <strong>{action.timeline}</strong></span>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-xs">
              <strong>💡 AI Insight:</strong> {action.aiInsight}
            </div>
            
            {action.status === 'pending' && (
              <Button size="sm" variant="outline" className="w-full">
                Start Action
              </Button>
            )}
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Next AI Analysis</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Your data will be re-analyzed in 3 days to update your growth plan based on recent performance.
          </p>
          <Button size="sm" variant="outline" className="w-full">
            Request Early Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 