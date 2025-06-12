// Soundcharts API client for frontend

export interface SearchArtistsResponse {
  items: Array<{
    uuid: string;
    name: string;
    image?: string;
    imageUrl?: string;
    slug?: string;
    verified?: boolean;
    genres?: string[];
    country?: string;
  }>;
  page: {
    offset: number;
    total: number;
    next: string | null;
    previous: string | null;
    limit: number;
  };
}

export interface ArtistAudience {
  platform: string;
  value: number;
  change: number;
  date: string;
}

export interface ArtistEvent {
  id: string;
  name: string;
  date: string;
  venue: {
    name: string;
    city: string;
    country: string;
  };
  type: string;
}

class SoundchartsClient {
  private baseUrl = '/api/soundcharts';

  async searchArtists(query: string, limit = 10): Promise<SearchArtistsResponse> {
    const response = await fetch(`${this.baseUrl}/search/artists?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to search artists');
    }
    return response.json();
  }

  async getArtist(uuid: string) {
    const response = await fetch(`${this.baseUrl}/artist/${uuid}`);
    if (!response.ok) {
      throw new Error('Failed to fetch artist');
    }
    return response.json();
  }

  async getArtistStats(uuid: string) {
    const response = await fetch(`${this.baseUrl}/artist/${uuid}/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch artist stats');
    }
    return response.json();
  }

  async getArtistAudience(uuid: string, platform: string): Promise<ArtistAudience[]> {
    const response = await fetch(`${this.baseUrl}/artist/${uuid}/audience/${platform}`);
    if (!response.ok) {
      throw new Error('Failed to fetch artist audience');
    }
    return response.json();
  }

  async getArtistStreaming(uuid: string, platform = 'spotify') {
    const response = await fetch(`${this.baseUrl}/artist/${uuid}/streaming/${platform}`);
    if (!response.ok) {
      throw new Error('Failed to fetch artist streaming data');
    }
    return response.json();
  }

  async getArtistEvents(uuid: string): Promise<ArtistEvent[]> {
    const response = await fetch(`${this.baseUrl}/artist/${uuid}/events`);
    if (!response.ok) {
      throw new Error('Failed to fetch artist events');
    }
    return response.json();
  }

  async getArtistSongs(uuid: string, limit = 20) {
    const response = await fetch(`${this.baseUrl}/artist/${uuid}/songs?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch artist songs');
    }
    return response.json();
  }

  async getArtistPlaylists(uuid: string, platform = 'spotify') {
    const response = await fetch(`${this.baseUrl}/artist/${uuid}/playlists/${platform}`);
    if (!response.ok) {
      throw new Error('Failed to fetch artist playlists');
    }
    return response.json();
  }

  async getSimilarArtists(uuid: string) {
    const response = await fetch(`${this.baseUrl}/artist/${uuid}/similar`);
    if (!response.ok) {
      throw new Error('Failed to fetch similar artists');
    }
    return response.json();
  }
}

export const soundchartsClient = new SoundchartsClient(); 