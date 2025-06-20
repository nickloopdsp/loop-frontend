import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import Globe from 'react-globe.gl';
import { Plus, Minus, Loader2, Globe as GlobeIcon } from "lucide-react";
import countries from '@/data/globe.json';
import useArtistStore from "@/stores/useArtistStore";
import { soundchartsClient, ArtistEvent } from '@/lib/soundcharts';

type FilterType = 'followers' | 'streams' | 'concerts';

interface FanLocation {
  id: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
  fans: number;
  color: string;
  size: number;
  type: FilterType;
  isPrimary?: boolean;
  // Concert-specific fields
  concertData?: {
    name: string;
    date: string;
    venue: string;
    city: string;
  };
}

// Country coordinates mapping
const countryCoordinates: Record<string, { lat: number; lng: number; region: string }> = {
  'US': { lat: 39.8283, lng: -98.5795, region: 'United States' },
  'GB': { lat: 51.5074, lng: -0.1278, region: 'United Kingdom' },
  'CA': { lat: 56.1304, lng: -106.3468, region: 'Canada' },
  'AU': { lat: -25.2744, lng: 133.7751, region: 'Australia' },
  'DE': { lat: 51.1657, lng: 10.4515, region: 'Germany' },
  'FR': { lat: 46.2276, lng: 2.2137, region: 'France' },
  'JP': { lat: 36.2048, lng: 138.2529, region: 'Japan' },
  'BR': { lat: -14.2350, lng: -51.9253, region: 'Brazil' },
  'MX': { lat: 23.6345, lng: -102.5528, region: 'Mexico' },
  'IN': { lat: 20.5937, lng: 78.9629, region: 'India' },
  'KR': { lat: 35.9078, lng: 127.7669, region: 'South Korea' },
  'ES': { lat: 40.4637, lng: -3.7492, region: 'Spain' },
  'IT': { lat: 41.8719, lng: 12.5674, region: 'Italy' },
  'NL': { lat: 52.1326, lng: 5.2913, region: 'Netherlands' },
  'SE': { lat: 60.1282, lng: 18.6435, region: 'Sweden' },
  'NO': { lat: 60.4720, lng: 8.4689, region: 'Norway' },
  'PL': { lat: 51.9194, lng: 19.1451, region: 'Poland' },
  'AR': { lat: -38.4161, lng: -63.6167, region: 'Argentina' },
  'CL': { lat: -35.6751, lng: -71.5430, region: 'Chile' },
  'CO': { lat: 4.5709, lng: -74.2973, region: 'Colombia' }
};

// City coordinates mapping for common concert venues
const cityCoordinates: Record<string, { lat: number; lng: number; country: string }> = {
  // United States
  'New York': { lat: 40.7128, lng: -74.0060, country: 'United States' },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, country: 'United States' },
  'Chicago': { lat: 41.8781, lng: -87.6298, country: 'United States' },
  'Miami': { lat: 25.7617, lng: -80.1918, country: 'United States' },
  'Las Vegas': { lat: 36.1699, lng: -115.1398, country: 'United States' },
  'Nashville': { lat: 36.1627, lng: -86.7816, country: 'United States' },
  'Austin': { lat: 30.2672, lng: -97.7431, country: 'United States' },
  'San Francisco': { lat: 37.7749, lng: -122.4194, country: 'United States' },
  'Seattle': { lat: 47.6062, lng: -122.3321, country: 'United States' },
  'Boston': { lat: 42.3601, lng: -71.0589, country: 'United States' },
  'Atlanta': { lat: 33.7490, lng: -84.3880, country: 'United States' },
  'Denver': { lat: 39.7392, lng: -104.9903, country: 'United States' },

  // United Kingdom
  'London': { lat: 51.5074, lng: -0.1278, country: 'United Kingdom' },
  'Manchester': { lat: 53.4808, lng: -2.2426, country: 'United Kingdom' },
  'Birmingham': { lat: 52.4862, lng: -1.8904, country: 'United Kingdom' },
  'Glasgow': { lat: 55.8642, lng: -4.2518, country: 'United Kingdom' },
  'Liverpool': { lat: 53.4084, lng: -2.9916, country: 'United Kingdom' },
  'Bristol': { lat: 51.4545, lng: -2.5879, country: 'United Kingdom' },

  // Canada
  'Toronto': { lat: 43.6532, lng: -79.3832, country: 'Canada' },
  'Vancouver': { lat: 49.2827, lng: -123.1207, country: 'Canada' },
  'Montreal': { lat: 45.5017, lng: -73.5673, country: 'Canada' },
  'Calgary': { lat: 51.0447, lng: -114.0719, country: 'Canada' },

  // Australia
  'Sydney': { lat: -33.8688, lng: 151.2093, country: 'Australia' },
  'Melbourne': { lat: -37.8136, lng: 144.9631, country: 'Australia' },
  'Brisbane': { lat: -27.4698, lng: 153.0251, country: 'Australia' },
  'Perth': { lat: -31.9505, lng: 115.8605, country: 'Australia' },

  // Europe
  'Paris': { lat: 48.8566, lng: 2.3522, country: 'France' },
  'Berlin': { lat: 52.5200, lng: 13.4050, country: 'Germany' },
  'Amsterdam': { lat: 52.3676, lng: 4.9041, country: 'Netherlands' },
  'Stockholm': { lat: 59.3293, lng: 18.0686, country: 'Sweden' },
  'Oslo': { lat: 59.9139, lng: 10.7522, country: 'Norway' },
  'Copenhagen': { lat: 55.6761, lng: 12.5683, country: 'Denmark' },
  'Madrid': { lat: 40.4168, lng: -3.7038, country: 'Spain' },
  'Barcelona': { lat: 41.3851, lng: 2.1734, country: 'Spain' },
  'Rome': { lat: 41.9028, lng: 12.4964, country: 'Italy' },
  'Milan': { lat: 45.4642, lng: 9.1900, country: 'Italy' },
  'Vienna': { lat: 48.2082, lng: 16.3738, country: 'Austria' },
  'Zurich': { lat: 47.3769, lng: 8.5417, country: 'Switzerland' },

  // Asia
  'Tokyo': { lat: 35.6762, lng: 139.6503, country: 'Japan' },
  'Osaka': { lat: 34.6937, lng: 135.5023, country: 'Japan' },
  'Seoul': { lat: 37.5665, lng: 126.9780, country: 'South Korea' },
  'Singapore': { lat: 1.3521, lng: 103.8198, country: 'Singapore' },
  'Hong Kong': { lat: 22.3193, lng: 114.1694, country: 'Hong Kong' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, country: 'India' },
  'Delhi': { lat: 28.7041, lng: 77.1025, country: 'India' },
  'Bangkok': { lat: 13.7563, lng: 100.5018, country: 'Thailand' },

  // South America
  'São Paulo': { lat: -23.5505, lng: -46.6333, country: 'Brazil' },
  'Rio de Janeiro': { lat: -22.9068, lng: -43.1729, country: 'Brazil' },
  'Buenos Aires': { lat: -34.6118, lng: -58.3960, country: 'Argentina' },
  'Santiago': { lat: -33.4489, lng: -70.6693, country: 'Chile' },
  'Bogotá': { lat: 4.7110, lng: -74.0721, country: 'Colombia' },
  'Mexico City': { lat: 19.4326, lng: -99.1332, country: 'Mexico' },

  // Africa & Middle East
  'Cape Town': { lat: -33.9249, lng: 18.4241, country: 'South Africa' },
  'Dubai': { lat: 25.2048, lng: 55.2708, country: 'UAE' },
  'Tel Aviv': { lat: 32.0853, lng: 34.7818, country: 'Israel' }
};

const GlobalMapWidget = () => {
  const { selectedArtist, artistStats } = useArtistStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('followers');
  const [zoomLevel, setZoomLevel] = useState(2.5);
  const [hoveredPoint, setHoveredPoint] = useState<FanLocation | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [fanLocations, setFanLocations] = useState<FanLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<ArtistEvent[]>([]);
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  useEffect(() => {
    if (selectedArtist) {
      fetchEvents();
    }
  }, [selectedArtist]);

  useEffect(() => {
    if (selectedArtist && events.length >= 0) { // Allow for empty events array
      fetchAudienceGeography();
    }
  }, [selectedArtist, events]);

  const fetchEvents = async () => {
    if (!selectedArtist) return;

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
      },
      {
        id: '4',
        name: 'Rock Festival',
        date: '2024-08-20',
        venue: {
          name: 'Hollywood Bowl',
          city: 'Los Angeles',
          country: 'USA'
        },
        type: 'festival'
      },
      {
        id: '5',
        name: 'Indie Concert',
        date: '2024-09-10',
        venue: {
          name: 'Opera House',
          city: 'Sydney',
          country: 'Australia'
        },
        type: 'concert'
      },
      {
        id: '6',
        name: 'Jazz Night',
        date: '2024-09-25',
        venue: {
          name: 'Olympia',
          city: 'Paris',
          country: 'France'
        },
        type: 'concert'
      }
    ];
  };

  // Helper function to get city coordinates with fallback
  const getCityCoordinates = (city: string, country: string) => {
    // Try exact city match first
    const cityCoords = cityCoordinates[city];
    if (cityCoords) {
      console.log(`Found exact coordinates for ${city}:`, cityCoords);
      return { lat: cityCoords.lat, lng: cityCoords.lng, country: cityCoords.country };
    }

    // Fallback to country coordinates with slight offset
    const countryCode = getCountryCode(country);
    const countryCoords = countryCoordinates[countryCode];
    if (countryCoords) {
      console.log(`Using country fallback for ${city}, ${country} (${countryCode}):`, countryCoords);
      // Use city name hash for consistent offset instead of random
      let hash = 0;
      for (let i = 0; i < city.length; i++) {
        hash = ((hash << 5) - hash + city.charCodeAt(i)) & 0xffffffff;
      }
      const offsetLat = ((hash % 1000) / 1000 - 0.5) * 4;
      const offsetLng = (((hash >> 16) % 1000) / 1000 - 0.5) * 4;

      return {
        lat: countryCoords.lat + offsetLat,
        lng: countryCoords.lng + offsetLng,
        country: countryCoords.region
      };
    }

    // Final fallback to a default location
    console.log(`No coordinates found for ${city}, ${country}, using default`);
    return { lat: 0, lng: 0, country: 'Unknown' };
  };

  // Helper function to convert country names to codes
  const getCountryCode = (country: string): string => {
    const countryMap: Record<string, string> = {
      'USA': 'US',
      'United States': 'US',
      'UK': 'GB',
      'United Kingdom': 'GB',
      'Japan': 'JP',
      'Australia': 'AU',
      'Canada': 'CA',
      'Germany': 'DE',
      'France': 'FR',
      'Brazil': 'BR',
      'Mexico': 'MX',
      'Spain': 'ES',
      'Italy': 'IT',
      'Netherlands': 'NL',
      'Sweden': 'SE',
      'Norway': 'NO',
      'South Korea': 'KR',
      'India': 'IN',
      'Argentina': 'AR',
      'Chile': 'CL',
      'Colombia': 'CO'
    };
    return countryMap[country] || 'US';
  };

  const fetchAudienceGeography = async () => {
    if (!selectedArtist) return;

    setIsLoading(true);
    try {
      // Try to get audience data with geographic breakdown
      const response = await soundchartsClient.getArtistAudience(selectedArtist.uuid, 'spotify');

      // Generate locations based on artist popularity and stats
      const locations: FanLocation[] = [];
      let id = 0;

      // Use artist stats to estimate geographic distribution
      const totalFollowers = artistStats?.spotify?.followers || 1000000;

      // Typical distribution for popular artists
      const distribution = [
        { country: 'US', percentage: 0.35 },
        { country: 'GB', percentage: 0.12 },
        { country: 'CA', percentage: 0.08 },
        { country: 'AU', percentage: 0.06 },
        { country: 'DE', percentage: 0.05 },
        { country: 'FR', percentage: 0.04 },
        { country: 'JP', percentage: 0.04 },
        { country: 'BR', percentage: 0.04 },
        { country: 'MX', percentage: 0.03 },
        { country: 'IN', percentage: 0.03 },
        { country: 'KR', percentage: 0.02 },
        { country: 'ES', percentage: 0.02 },
        { country: 'IT', percentage: 0.02 },
        { country: 'NL', percentage: 0.02 },
        { country: 'SE', percentage: 0.02 },
        { country: 'NO', percentage: 0.01 },
        { country: 'PL', percentage: 0.01 },
        { country: 'AR', percentage: 0.01 },
        { country: 'CL', percentage: 0.01 },
        { country: 'CO', percentage: 0.01 }
      ];

      // Generate follower locations
      distribution.forEach((item, index) => {
        const coords = countryCoordinates[item.country];
        if (coords) {
          const fans = Math.round(totalFollowers * item.percentage);
          locations.push({
            id: `f${id++}`,
            country: coords.region,
            region: coords.region,
            lat: coords.lat + (Math.random() - 0.5) * 2,
            lng: coords.lng + (Math.random() - 0.5) * 2,
            fans: fans,
            color: '#10B981',
            size: Math.min(0.8, Math.max(0.2, fans / totalFollowers * 2)),
            type: 'followers',
            isPrimary: index < 5
          });
        }
      });

      // Generate streaming locations (similar but slightly different distribution)
      const totalStreams = artistStats?.spotify?.monthlyListeners || 2000000;
      distribution.forEach((item, index) => {
        const coords = countryCoordinates[item.country];
        if (coords) {
          const streams = Math.round(totalStreams * item.percentage * (0.8 + Math.random() * 0.4));
          locations.push({
            id: `s${id++}`,
            country: coords.region,
            region: coords.region,
            lat: coords.lat + (Math.random() - 0.5) * 2,
            lng: coords.lng + (Math.random() - 0.5) * 2,
            fans: streams,
            color: '#A855F7',
            size: Math.min(0.8, Math.max(0.2, streams / totalStreams * 2)),
            type: 'streams',
            isPrimary: index < 5
          });
        }
      });

      // Always use mock concert data for now to ensure proper coordinates
      console.log('Using mock concert data for debugging');
      const mockConcertData = [
        { city: 'New York', venue: 'Madison Square Garden', date: '2024-07-15', name: 'Summer Tour', country: 'United States' },
        { city: 'Los Angeles', venue: 'Hollywood Bowl', date: '2024-08-20', name: 'West Coast Show', country: 'United States' },
        { city: 'London', venue: 'O2 Arena', date: '2024-08-05', name: 'European Tour', country: 'United Kingdom' },
        { city: 'Tokyo', venue: 'Tokyo Dome', date: '2024-06-20', name: 'Asia Tour', country: 'Japan' },
        { city: 'Sydney', venue: 'Opera House', date: '2024-09-10', name: 'Australia Tour', country: 'Australia' },
        { city: 'Paris', venue: 'Olympia', date: '2024-09-25', name: 'European Tour', country: 'France' }
      ];

      mockConcertData.forEach((concert, index) => {
        const cityCoords = getCityCoordinates(concert.city, concert.country);
        console.log(`Mock Concert: ${concert.name} in ${concert.city}, ${concert.country}`, cityCoords);
        locations.push({
          id: `c${id++}`,
          country: cityCoords.country,
          region: concert.city,
          lat: cityCoords.lat,
          lng: cityCoords.lng,
          fans: 0,
          color: '#FB923C',
          size: 0.5,
          type: 'concerts',
          isPrimary: true,
          concertData: {
            name: concert.name,
            date: concert.date,
            venue: concert.venue,
            city: concert.city
          }
        });
      });

      console.log('Final concert locations:', locations.filter(loc => loc.type === 'concerts'));
      setFanLocations(locations);
    } catch (error) {
      console.error('Error fetching audience geography:', error);
      // Use default mock data
      generateMockLocations();
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockLocations = () => {
    // Generate mock data if API fails
    const mockLocations: FanLocation[] = [
      // Primary Followers
      { id: '1', country: 'United States', region: 'United States', lat: 39.8283, lng: -98.5795, fans: 4200000, color: '#10B981', size: 0.8, type: 'followers', isPrimary: true },
      { id: '2', country: 'United Kingdom', region: 'United Kingdom', lat: 51.5074, lng: -0.1278, fans: 2100000, color: '#10B981', size: 0.6, type: 'followers', isPrimary: true },
      { id: '3', country: 'Canada', region: 'Canada', lat: 56.1304, lng: -106.3468, fans: 1800000, color: '#10B981', size: 0.5, type: 'followers', isPrimary: true },
      // Add more as needed...
    ];
    setFanLocations(mockLocations);
  };

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Clear tooltip when mouse leaves the globe container
  useEffect(() => {
    const handleMouseLeave = () => {
      setHoveredPoint(null);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseleave', handleMouseLeave);
      return () => container.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, []);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Clear tooltip when filter changes
  useEffect(() => {
    setHoveredPoint(null);
  }, [activeFilter]);

  // Clear tooltip when clicking anywhere
  useEffect(() => {
    const handleClick = () => {
      setHoveredPoint(null);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Configure globe controls on mount
  useEffect(() => {
    if (globeRef.current) {
      // Disable auto-rotation and zoom
      const controls = globeRef.current.controls();
      controls.autoRotate = false;
      controls.enableZoom = false;

      // Set initial position - centered view
      globeRef.current.pointOfView({ lat: 0, lng: 0, altitude: zoomLevel });
    }
  }, []);

  useEffect(() => {
    if (globeRef.current && dimensions.width > 0) {
      // Set initial position
      globeRef.current.pointOfView({
        lat: 0,
        lng: 0,
        altitude: zoomLevel
      }, 0);

      // Try to access the globe's Three.js scene and make the globe opaque and dark
      setTimeout(() => {
        if (globeRef.current && globeRef.current.scene) {
          const scene = globeRef.current.scene();
          scene.traverse((obj: any) => {
            if (obj.type === 'Mesh' && obj.material) {
              const THREE = (window as any).THREE;
              if (!THREE) return;

              // Check if this is the main globe mesh
              if (obj.geometry && obj.geometry.type === 'SphereGeometry') {
                // Create a solid black material for the globe
                const newMaterial = new THREE.MeshPhongMaterial({
                  color: 0x000000,
                  transparent: false,
                  opacity: 1,
                  emissive: 0x03FF96,
                  emissiveIntensity: 0.02,
                  shininess: 0,
                  side: THREE.DoubleSide
                });
                obj.material = newMaterial;
              }
            }
          });
        }
      }, 1500);
    }
  }, [dimensions, zoomLevel]);

  const handleZoomIn = () => {
    if (zoomLevel > 1.2) {
      const newZoom = Math.max(zoomLevel - 0.3, 1.2);
      setZoomLevel(newZoom);
      if (globeRef.current) {
        globeRef.current.pointOfView({ altitude: newZoom });
      }
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel < 3.5) {
      const newZoom = Math.min(zoomLevel + 0.3, 3.5);
      setZoomLevel(newZoom);
      if (globeRef.current) {
        globeRef.current.pointOfView({ altitude: newZoom });
      }
    }
  };

  const getFilteredLocations = () => {
    return fanLocations.filter(loc => loc.type === activeFilter);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  const getMetricLabel = (type: FilterType) => {
    switch (type) {
      case 'followers':
        return 'Followers';
      case 'streams':
        return 'Monthly Streams';
      case 'concerts':
        return 'Concert';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!selectedArtist) {
    return (
      <div className="glass-widget text-white h-full flex items-center justify-center">
        <p className="text-gray-400 text-center">Select an artist to view global audience</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-widget text-white h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#0a0a0a] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <GlobeIcon className="w-5 h-5 text-green-400" />
        <h3 className="text-white text-lg font-medium">Your Music Goes Global</h3>
      </div>

      {/* Filter Pills */}
      <div className="absolute top-4 right-20 z-10 flex gap-2">
        <button
          onClick={() => setActiveFilter('followers')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilter === 'followers'
              ? 'bg-[#03FF96] text-black'
              : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.08]'
            }`}
        >
          Followers
        </button>
        <button
          onClick={() => setActiveFilter('streams')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilter === 'streams'
              ? 'bg-purple-500 text-white'
              : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.08]'
            }`}
        >
          Streams
        </button>
        <button
          onClick={() => setActiveFilter('concerts')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilter === 'concerts'
              ? 'bg-orange-500 text-white'
              : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.08]'
            }`}
        >
          Concerts
        </button>
      </div>

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-50 bg-black/90 backdrop-blur-md rounded-lg p-3 border border-white/10 pointer-events-none"
          style={{
            left: Math.min(Math.max(mousePos.x, 100), dimensions.width - 250),
            top: Math.max(mousePos.y - 80, 10),
            minWidth: '200px'
          }}
        >
          {hoveredPoint.type === 'concerts' && hoveredPoint.concertData ? (
            <div>
              <div className="text-white font-medium">{hoveredPoint.concertData.name}</div>
              <div className="text-sm text-white/80 mt-1">{hoveredPoint.concertData.venue}</div>
              <div className="text-sm text-white/70">{hoveredPoint.region}, {hoveredPoint.country}</div>
              <div className="text-sm text-orange-400 mt-2 font-medium">
                📅 {formatDate(hoveredPoint.concertData.date)}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-white font-medium">{hoveredPoint.region}, {hoveredPoint.country}</div>
              <div className="text-sm text-white/70 mt-1">
                {getMetricLabel(hoveredPoint.type)}: {formatNumber(hoveredPoint.fans)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Globe Container with dark background */}
      <div
        ref={containerRef}
        className="w-full h-full bg-[#0a0a0a] flex items-center justify-center relative"
        style={{ minHeight: '300px', cursor: 'grab' }}
      >
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(10,10,10,0)"
          showAtmosphere={true}
          atmosphereColor="#03FF96"
          atmosphereAltitude={0.15}
          globeImageUrl={undefined}
          bumpImageUrl={undefined}
          backgroundImageUrl={undefined}
          showGraticules={false}
          hexPolygonsData={countries.features}
          hexPolygonResolution={3}
          hexPolygonMargin={0.3}
          hexPolygonColor={() => 'rgba(3, 255, 150, 0.3)'}
          hexPolygonAltitude={0}
          pointsData={getFilteredLocations()}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={0.005}
          pointRadius={d => {
            const location = d as FanLocation;
            return location.isPrimary ? 0.4 : 0.2;
          }}
          pointColor={d => {
            const location = d as FanLocation;
            const baseColor = activeFilter === 'followers' ? '#03FF96' :
              activeFilter === 'streams' ? '#a855f7' :
                '#f97316';
            return location.isPrimary ? baseColor : baseColor + '80';
          }}
          pointsMerge={false}
          ringsData={getFilteredLocations()}
          ringLat="lat"
          ringLng="lng"
          ringAltitude={0.005}
          ringColor={() => {
            if (activeFilter === 'followers') return '#03FF9620';
            if (activeFilter === 'streams') return '#a855f720';
            return '#f9731620';
          }}
          ringMaxRadius={1.5}
          ringPropagationSpeed={0.3}
          ringRepeatPeriod={4000}
          enablePointerInteraction={true}
          onPointHover={(point: object | null) => {
            setHoveredPoint(point as FanLocation | null);
          }}
          onPointClick={() => { }}
          animateIn={true}
          waitForGlobeReady={true}
          rendererConfig={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
          }}
        />

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white/[0.03] backdrop-blur-md rounded-lg p-1 border border-white/[0.05] shadow-lg">
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel <= 1.2}
            className="p-2 hover:bg-white/[0.05] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel >= 3.5}
            className="p-2 hover:bg-white/[0.05] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalMapWidget; 