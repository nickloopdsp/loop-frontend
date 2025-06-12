import { useState, useEffect } from "react";
import { Calendar, MapPin, Loader2, Music, Sparkles, Users } from "lucide-react";
import { useArtist } from "@/contexts/ArtistContext";
import { soundchartsClient, ArtistEvent } from "@/lib/soundcharts";
import { useChat } from "@/contexts/ChatContext";

type EventType = 'all' | 'concerts' | 'festivals';

export default function EventsWidget() {
  const { selectedArtist } = useArtist();
  const { addMCMessage } = useChat();
  const [events, setEvents] = useState<ArtistEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<EventType>('all');

  useEffect(() => {
    if (selectedArtist) {
      fetchEvents();
    }
  }, [selectedArtist]);

  const fetchEvents = async () => {
    if (!selectedArtist) return;
    
    setIsLoading(true);
    try {
      const artistEvents = await soundchartsClient.getArtistEvents(selectedArtist.uuid);
      setEvents(artistEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to mock data if API fails
      setEvents(getMockEvents());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockEvents = (): ArtistEvent[] => {
    return [
      {
        id: '1',
        name: 'Summer Music Festival',
        date: '2024-07-15',
        venue: {
          name: 'Madison Square Garden',
          city: 'New York',
          country: 'USA'
        },
        type: 'festival'
      },
      {
        id: '2',
        name: 'Acoustic Night',
        date: '2024-06-20',
        venue: {
          name: 'Blue Note',
          city: 'Tokyo',
          country: 'Japan'
        },
        type: 'concert'
      },
      {
        id: '3',
        name: 'Electronic Music Showcase',
        date: '2024-08-05',
        venue: {
          name: 'O2 Arena',
          city: 'London',
          country: 'UK'
        },
        type: 'concert'
      }
    ];
  };

  const filteredEvents = events.filter(event => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'concerts') return event.type === 'concert';
    if (activeFilter === 'festivals') return event.type === 'festival';
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'festival':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'concert':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const handleMCClick = (event: ArtistEvent) => {
    addMCMessage(`Let's plan your performance strategy for ${event.name} at ${event.venue.name}! I can help with setlists, promotional content, and fan engagement tactics for this ${event.type}.`);
  };

  return (
    <div className="text-foreground w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Upcoming Events</h3>
        <span className="text-muted-foreground text-sm">
          {filteredEvents.length} {activeFilter === 'all' ? 'events' : activeFilter}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="relative mb-4">
        <div className="glass-tabs p-1 flex relative">
          <div 
            className="absolute top-1 bottom-1 bg-white/10 dark:bg-white/10 light:bg-black/10 rounded-full transition-all duration-300 ease-out"
            style={{
              left: activeFilter === 'all' ? '4px' : activeFilter === 'concerts' ? '33.33%' : '66.67%',
              width: 'calc(33.33% - 4px)',
            }}
          />
          
          <button 
            onClick={() => setActiveFilter('all')}
            className={`relative z-10 text-sm px-4 py-2 flex-1 transition-colors duration-200 ${
              activeFilter === 'all' ? 'text-foreground font-medium' : 'text-muted-foreground'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveFilter('concerts')}
            className={`relative z-10 text-sm px-4 py-2 flex-1 transition-colors duration-200 ${
              activeFilter === 'concerts' ? 'text-foreground font-medium' : 'text-muted-foreground'
            }`}
          >
            Concerts
          </button>
          <button 
            onClick={() => setActiveFilter('festivals')}
            className={`relative z-10 text-sm px-4 py-2 flex-1 transition-colors duration-200 ${
              activeFilter === 'festivals' ? 'text-foreground font-medium' : 'text-muted-foreground'
            }`}
          >
            Festivals
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {!selectedArtist ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-center">Search and select an artist to view upcoming events</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div 
                key={event.id} 
                className="glass-item p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                      <h4 className="text-foreground font-medium">{event.name}</h4>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.venue.name} • {event.venue.city}, {event.venue.country}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* MC Button */}
                  <button 
                    onClick={() => handleMCClick(event)}
                    className="bg-gray-800/50 hover:bg-gray-700/50 text-white text-sm px-3 py-1.5 rounded-full border border-gray-600/50 flex items-center gap-1.5 transition-all duration-200 hover:shadow-[0_0_20px_rgba(3,255,150,0.4)] hover:border-[#03FF96]/50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    MC
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Music className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-center">No upcoming events found</p>
            <p className="text-sm text-center mt-1">Check back later for new tour dates</p>
          </div>
        )}
      </div>
    </div>
  );
} 