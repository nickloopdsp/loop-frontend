import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";

export default function ArtistMapTool() {
  const { data: geoData, isLoading } = useQuery({
    queryKey: ["/api/mock/geo-data"],
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-card border-border">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <CardTitle className="text-lg font-semibold">Fan Density Map</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            View Details
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div className="h-64 bg-muted/30 rounded-lg relative overflow-hidden mb-4">
          <img 
            src="https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300" 
            alt="World map visualization showing fan density" 
            className="w-full h-full object-cover opacity-50" 
          />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-4 text-center">
              <div className="flex justify-center space-x-8">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse-slow"></div>
                <div className="w-6 h-6 bg-emerald-500 rounded-full animate-pulse-slow"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse-slow"></div>
              </div>
              <p className="text-xs text-muted-foreground">Interactive geo-heatmap visualization</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-400">{geoData?.topRegion.listeners}</p>
            <p className="text-xs text-muted-foreground">{geoData?.topRegion.name}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400">{geoData?.secondRegion.listeners}</p>
            <p className="text-xs text-muted-foreground">{geoData?.secondRegion.name}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-yellow-400">{geoData?.thirdRegion.listeners}</p>
            <p className="text-xs text-muted-foreground">{geoData?.thirdRegion.name}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
