import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { Sparkles, ChevronLeft, ChevronRight, Clock, Info, MapPin, Calendar } from "lucide-react";
import { useArtist } from "@/contexts/ArtistContext";
import { soundchartsClient, ArtistEvent } from "@/lib/soundcharts";

type TabType = 'todos' | 'mc';

interface TodoItem {
  id: number | string;
  task: string;
  time: string;
  date: string;
  type: "regular" | "mc" | "concert" | "scheduled-mc";
  aiExplanation?: string;
  fullStrategy?: string;
  venue?: string;
  city?: string;
  country?: string;
  eventType?: string;
}

const todoData: TodoItem[] = [
  {
    id: 1,
    task: "Create post on TikTok",
    time: "08:00 pm - 09:00 pm",
    date: "December 15",
    type: "regular"
  },
  {
    id: 2,
    task: "Post stories on Instagram", 
    time: "09:00 pm - 10:00 pm",
    date: "December 18",
    type: "regular"
  },
  {
    id: 3,
    task: "Do an Instagram stream",
    time: "07:00 am - 11:00 am", 
    date: "December 22",
    type: "regular"
  },
  {
    id: 4,
    task: "Post short on YouTube",
    time: "10:00 am - 11:00 am",
    date: "January 5", 
    type: "regular"
  },
  {
    id: 9,
    task: "Upload new song teaser on TikTok",
    time: "02:00 pm - 03:00 pm",
    date: "January 12",
    type: "regular"
  },
  {
    id: 10,
    task: "Respond to fan DMs",
    time: "04:00 pm - 05:00 pm",
    date: "January 20",
    type: "regular"
  },
  {
    id: 11,
    task: "Plan content for next week",
    time: "06:00 pm - 07:00 pm",
    date: "February 3",
    type: "regular"
  },
  {
    id: 12,
    task: "Review analytics from last post",
    time: "12:00 pm - 01:00 pm",
    date: "February 14",
    type: "regular"
  }
];

const mcSuggestedTodos: TodoItem[] = [
  {
    id: 5,
    task: "Analyze TikTok trending sounds for your genre",
    time: "02:00 pm - 03:00 pm",
    date: "September 27",
    type: "mc",
    aiExplanation: "Your recent tracks show strong melodic patterns that align with current trending sounds.",
    fullStrategy: "Based on your music style analysis, I've identified 3 trending sounds that match your melodic structure and could boost your reach by 40%. Let me show you the specific sounds and how to integrate them."
  },
  {
    id: 6,
    task: "Engage with fan comments from yesterday's posts",
    time: "11:00 am - 12:00 pm", 
    date: "September 27",
    type: "mc",
    aiExplanation: "You have 47 unresponded comments that could convert to loyal fans with engagement.",
    fullStrategy: "I've analyzed your comment patterns and identified high-value fans waiting for responses. Engaging now could increase your follower retention by 25% and boost algorithm reach."
  },
  {
    id: 7,
    task: "Plan Instagram Reels for next week's release",
    time: "03:00 pm - 04:00 pm",
    date: "September 27",
    type: "mc",
    aiExplanation: "Your audience is most active during next week's planned content gaps.",
    fullStrategy: "I've mapped your audience activity patterns and found optimal posting windows with 60% higher engagement potential. Let me show you the content strategy and timing breakdown."
  },
  {
    id: 8,
    task: "Research collaboration opportunities with similar artists",
    time: "05:00 pm - 06:00 pm",
    date: "September 27",
    type: "mc",
    aiExplanation: "3 artists in your genre gained 50K+ followers this month through strategic collabs.",
    fullStrategy: "I've identified artists with complementary audiences and similar growth trajectories. These collaborations could expand your reach by 35% based on cross-audience analysis."
  },
  {
    id: 13,
    task: "Optimize posting times based on audience insights",
    time: "09:00 am - 10:00 am",
    date: "September 28",
    type: "mc",
    aiExplanation: "Your current posting schedule misses 65% of your audience's peak activity.",
    fullStrategy: "I've analyzed 30 days of your audience behavior and found optimal posting windows that could double your engagement. Let me share the complete scheduling strategy."
  },
  {
    id: 14,
    task: "Create playlist with trending songs in your genre",
    time: "01:00 pm - 02:00 pm",
    date: "September 28",
    type: "mc",
    aiExplanation: "Curated playlists increase artist discoverability by 40% in your genre.",
    fullStrategy: "I've identified trending tracks that complement your style and could position you within influential playlists. This strategy has helped similar artists gain playlist features."
  },
  {
    id: 15,
    task: "Reach out to music bloggers for feature opportunities",
    time: "03:30 pm - 04:30 pm",
    date: "September 28",
    type: "mc",
    aiExplanation: "5 bloggers recently featured artists with similar styles and audience size.",
    fullStrategy: "I've compiled a list of music bloggers actively seeking artists in your genre, with personalized outreach templates based on their recent coverage patterns."
  },
  {
    id: 16,
    task: "Schedule cross-platform content for maximum reach",
    time: "07:00 pm - 08:00 pm",
    date: "September 28",
    type: "mc",
    aiExplanation: "Cross-platform posting increases content reach by 3x when timed correctly.",
    fullStrategy: "I've created a synchronized content calendar that maximizes exposure across TikTok, Instagram, and YouTube based on each platform's algorithm preferences."
  },
  {
    id: 17,
    task: "Analyze competitor engagement strategies",
    time: "10:00 am - 11:00 am",
    date: "September 29",
    type: "mc",
    aiExplanation: "Top artists in your space use 3 specific engagement tactics you're not utilizing.",
    fullStrategy: "I've analyzed successful artists in your genre and identified proven engagement strategies that could increase your fan interaction by 45%. Let me break down these tactics."
  }
];

const calendarDays = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
];

const calendarGrid = [
  [29, 30, 31, 1, 2, 3, 4],
  [5, 6, 7, 8, 9, 10, 11], 
  [12, 13, 14, 15, 16, 17, 18],
  [19, 20, 21, 22, 23, 24, 25],
  [26, 27, 28, 29, 30, 31, 1]
];

export default function ConcertsWidget() {
  const { selectedArtist } = useArtist();
  const [activeTab, setActiveTab] = useState<TabType>('todos');
  const [currentMonth, setCurrentMonth] = useState('January 2022');
  const [selectedDate, setSelectedDate] = useState<number | null>(8); // Default to date 8 as shown in Figma
  const [hoveredTodo, setHoveredTodo] = useState<number | string | null>(null);
  const [events, setEvents] = useState<ArtistEvent[]>([]);
  const [concertTodos, setConcertTodos] = useState<TodoItem[]>([]);
  const [scheduledMcTodos, setScheduledMcTodos] = useState<TodoItem[]>([]); // MC todos that have been scheduled
  const [highlightedDate, setHighlightedDate] = useState<number | null>(null); // Date to highlight in calendar
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch events when artist is selected, or use mock events if no artist
  useEffect(() => {
    fetchEvents();
  }, [selectedArtist]);

  // Convert events to concert todos (limit to top 10 upcoming)
  useEffect(() => {
    const convertEventsToConcertTodos = () => {
      // Filter for future events and limit to 10 upcoming performances
      const sortedEvents = events
        .filter(event => new Date(event.date) >= new Date()) // Only future events
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 10); // Limit to 10 performances

      const concertTodoItems: TodoItem[] = sortedEvents.map((event, index) => ({
        id: `concert-${event.id}`,
        task: `🎵 ${event.name}`,
        time: "Evening Performance", // Default since exact time usually not provided
        date: formatEventDate(event.date),
        type: "concert" as const,
        venue: event.venue?.name || "TBA",
        city: event.venue?.city || "TBA",
        country: event.venue?.country || "TBA",
        eventType: event.type
      }));
      
      setConcertTodos(concertTodoItems);
    };

    convertEventsToConcertTodos();
  }, [events]);

  const fetchEvents = async () => {
    if (!selectedArtist) {
      setEvents(getMockEvents());
      return;
    }
    
    try {
      const artistEvents = await soundchartsClient.getArtistEvents(selectedArtist.uuid);
      setEvents(artistEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to mock events if API fails
      setEvents(getMockEvents());
    }
  };

  const getMockEvents = (): ArtistEvent[] => {
    return [
      {
        id: '1',
        name: 'Winter Music Festival',
        date: '2025-01-15',
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
        date: '2025-01-22',
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
        date: '2025-02-05',
        venue: {
          name: 'O2 Arena',
          city: 'London',
          country: 'UK'
        },
        type: 'concert'
      },
      {
        id: '4',
        name: 'Spring Tour Kickoff',
        date: '2025-03-12',
        venue: {
          name: 'Coachella Valley Music Festival',
          city: 'Indio',
          country: 'USA'
        },
        type: 'festival'
      },
      {
        id: '5',
        name: 'Intimate Club Show',
        date: '2025-02-28',
        venue: {
          name: 'The Troubadour',
          city: 'Los Angeles',
          country: 'USA'
        },
        type: 'concert'
      }
    ];
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric'
    });
  };

  // Combine all todos based on active tab
  const getAllTodos = (): TodoItem[] => {
    if (activeTab === 'todos') {
      // On todos tab: show concerts, regular todos, and scheduled MC todos
      return [...concertTodos, ...todoData, ...scheduledMcTodos].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    } else {
      // On MC tab: show only unscheduled MC suggestions
      const unscheduledMcTodos = mcSuggestedTodos.filter(
        mcTodo => !scheduledMcTodos.some(scheduled => scheduled.id === mcTodo.id)
      );
      return unscheduledMcTodos.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    }
  };

  const currentTodos = getAllTodos();
  const totalEvents = activeTab === 'todos' 
    ? concertTodos.length + todoData.length + scheduledMcTodos.length 
    : mcSuggestedTodos.length - scheduledMcTodos.length;



  const handleLearnMore = (todo: TodoItem) => {
    // This would open the MC chat window with the full strategy
    console.log('Opening MC chat with strategy:', todo.fullStrategy);
    // TODO: Implement MC chat window opening with the full strategy
  };

  const handleTodoClick = (todo: TodoItem) => {
    // Extract day from todo date and highlight it in calendar
    const todoDate = new Date(todo.date);
    const day = todoDate.getDate();
    setHighlightedDate(day);
    setSelectedDate(day);
  };

  const handleAddToCalendar = (todo: TodoItem) => {
    // Move MC suggestion to scheduled todos
    const scheduledTodo = {
      ...todo,
      type: 'scheduled-mc' as const
    };
    setScheduledMcTodos(prev => [...prev, scheduledTodo]);
    
    // Highlight the date in calendar
    const todoDate = new Date(todo.date);
    const day = todoDate.getDate();
    setHighlightedDate(day);
    setSelectedDate(day);
  };

  const handleTooltipMouseEnter = (todoId: number | string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredTodo(todoId);
  };

  const handleTooltipMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTodo(null);
    }, 200); // 200ms delay before hiding
  };

  const getTaskIcon = (todo: TodoItem) => {
    if (todo.type === 'concert') {
      return <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-orange-400" />;
    }
    return <Clock className="w-3.5 h-3.5 flex-shrink-0" />;
  };

  const getTaskDetails = (todo: TodoItem) => {
    if (todo.type === 'concert') {
      return (
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          {getTaskIcon(todo)}
          <span className="truncate">{todo.time}, {todo.date}</span>
          {todo.venue && (
            <>
              <span className="text-muted-foreground">•</span>
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{todo.venue}, {todo.city}</span>
            </>
          )}
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        {getTaskIcon(todo)}
        <span className="truncate">{todo.time}, {todo.date}</span>
      </div>
    );
  };

  const getTaskBackground = (todo: TodoItem) => {
    if (todo.type === 'concert') {
      return {
        background: 'rgba(251, 146, 60, 0.1)', // Orange tint for concerts
        border: '1px solid rgba(251, 146, 60, 0.2)'
      };
    }
    if (todo.type === 'scheduled-mc') {
      return {
        background: 'rgba(3, 255, 150, 0.1)', // Green tint for scheduled MC suggestions
        border: '1px solid rgba(3, 255, 150, 0.2)'
      };
    }
    return {
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    };
  };

  return (
    <div className="text-foreground w-full h-full flex flex-col px-4 pt-0 pb-4 gap-2">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">To-Do's</h3>
          <span className="text-muted-foreground text-sm">
            {totalEvents} events this month 
            {activeTab === 'todos' && concertTodos.length > 0 && (
              <span className="text-orange-400"> • {concertTodos.length} concerts</span>
            )}
            {activeTab === 'todos' && scheduledMcTodos.length > 0 && (
              <span className="text-green-400"> • {scheduledMcTodos.length} MC scheduled</span>
            )}
          </span>
        </div>
        <button className="text-green-400 text-sm hover:text-green-300">Show more</button>
      </div>

      {/* Sliding Pill Tabs */}
      <div className="flex justify-start">
        <div className="glass-tabs p-1 flex relative w-fit">
          {/* Sliding background */}
          <div 
            className="absolute top-1 bottom-1 bg-white/10 dark:bg-white/10 light:bg-black/10 rounded-full transition-all duration-300 ease-out"
            style={{
              left: activeTab === 'todos' ? '4px' : '50%',
              width: activeTab === 'todos' ? 'calc(50% - 4px)' : 'calc(50% - 4px)',
            }}
          />
          
          {/* Tab buttons */}
          <button 
            onClick={() => setActiveTab('todos')}
            className={`relative z-10 text-sm px-6 py-2 transition-colors duration-200 ${
              activeTab === 'todos' ? 'text-foreground font-medium' : 'text-muted-foreground'
            }`}
          >
            To-Do's
          </button>
          <button 
            onClick={() => setActiveTab('mc')}
            className={`relative z-10 text-sm px-6 py-2 transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'mc' 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground'
            }`}
            style={{
              ...(activeTab === 'mc' && {
                color: '#03FF96',
                textShadow: '0 0 8px rgba(3, 255, 150, 0.5)',
                filter: 'drop-shadow(0 0 4px rgba(3, 255, 150, 0.3))'
              })
            }}
          >
            <Sparkles className="w-4 h-4" />
            MC
          </button>
        </div>
      </div>

      {/* Main Content - Two Column Layout with Fixed Height */}
      <div className="flex gap-4 w-full" style={{ height: '270px' }}>
        {/* Left Column - Todo List */}
        <div className="flex-1 min-w-0 h-full overflow-y-auto space-y-2 pr-2">
          {currentTodos.map((todo) => (
            <div 
              key={todo.id} 
              className="relative flex items-center justify-between py-2 px-3 text-white rounded-lg cursor-pointer hover:brightness-110 transition-all duration-200"
              style={{
                ...getTaskBackground(todo),
                backdropFilter: 'blur(14px)',
              }}
              onClick={() => handleTodoClick(todo)}
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="text-foreground font-medium text-sm mb-1 line-clamp-2">{todo.task}</div>
                {getTaskDetails(todo)}
              </div>
              {/* Show "Add to calendar" button and AI tooltip for MC suggestions only */}
              {todo.type === 'mc' && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering todo click
                      handleAddToCalendar(todo);
                    }}
                    className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-foreground rounded-full border border-gray-600/50 transition-all duration-200"
                  >
                    Add to calendar
                  </button>
                  <div 
                    className="relative"
                    onMouseEnter={() => handleTooltipMouseEnter(todo.id)}
                    onMouseLeave={handleTooltipMouseLeave}
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200 flex items-center justify-center cursor-pointer">
                      <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Column - Calendar */}
        <div 
          className="flex flex-col w-80 h-full p-4 rounded-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between w-full mb-4">
            <h4 className="text-foreground font-medium">{currentMonth}</h4>
            <div className="flex items-center gap-2">
              <button className="text-muted-foreground hover:text-foreground p-1 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="text-muted-foreground hover:text-foreground p-1 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="w-full flex-1">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              {calendarDays.map((day) => (
                <div key={day} className="text-muted-foreground text-xs text-center p-1 font-medium">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar dates grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarGrid.flat().map((date, index) => {
                const isCurrentMonth = date <= 31 && (index < 31 || date > 25);
                const isSelected = selectedDate === date && isCurrentMonth;
                const isHighlighted = highlightedDate === date && isCurrentMonth;
                const isToday = date === 26 && isCurrentMonth;
                
                return (
                  <div key={index} className="flex items-center justify-center">
                    <button
                      onClick={() => isCurrentMonth ? setSelectedDate(date) : null}
                      className={`
                        relative text-center text-sm transition-all duration-200 cursor-pointer
                        ${isCurrentMonth ? 'text-foreground hover:bg-gray-700/30' : 'text-muted-foreground cursor-default'}
                        ${isToday && !isSelected && !isHighlighted ? 'bg-white/10 font-medium' : ''}
                        ${isSelected ? 'text-gray-900 font-semibold' : ''}
                        ${isHighlighted ? 'font-semibold' : ''}
                      `}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {/* Green circular background for selected date */}
                      {isSelected && (
                        <div 
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: '#03FF96',
                          }}
                        />
                      )}
                      {/* Blue/teal circular background for highlighted date (different from selected) */}
                      {isHighlighted && !isSelected && (
                        <div 
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: 'rgba(3, 255, 150, 0.3)',
                            border: '2px solid rgba(3, 255, 150, 0.6)'
                          }}
                        />
                      )}
                      <span className="relative z-10">{date}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Global Tooltip */}
      {hoveredTodo && activeTab === 'mc' && (() => {
        const hoveredMcTodo = mcSuggestedTodos.find(todo => todo.id === hoveredTodo);
        if (!hoveredMcTodo) return null;
        
        return (
          <div 
            className="fixed w-80 p-4 rounded-lg border border-gray-600/50 shadow-xl"
            style={{
              background: 'rgba(20, 20, 20, 0.95)',
              backdropFilter: 'blur(20px)',
              left: '50%',
              top: '30%',
              transform: 'translate(-50%, -50%)',
              zIndex: 999999,
            }}
            onMouseEnter={() => handleTooltipMouseEnter(hoveredTodo)}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-foreground font-medium mb-1">AI Suggestion</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {hoveredMcTodo.aiExplanation}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleLearnMore(hoveredMcTodo)}
                className="w-full px-3 py-2 text-xs bg-green-400/10 hover:bg-green-400/20 text-green-400 rounded-lg border border-green-400/30 transition-all duration-200 font-medium"
              >
                Learn More
              </button>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 border-r border-b border-gray-600/50 rotate-45"></div>
          </div>
        );
      })()}
    </div>
  );
} 