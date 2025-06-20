import { create } from 'zustand'

export interface Artist {
    uuid: string;
    name: string;
    image?: string;
    imageUrl?: string;
    slug?: string;
    verified?: boolean;
    genres?: string[];
    country?: string;
}

export interface ArtistStats {
    spotify?: {
        followers: number;
        monthlyListeners: number;
        popularity: number;
    };
    instagram?: {
        followers: number;
        engagement: number;
    };
    tiktok?: {
        followers: number;
        likes: number;
    };
    youtube?: {
        subscribers: number;
        views: number;
    };
}


interface ArtistStoreType {
    selectedArtist: Artist | null;
    artistStats: ArtistStats | null;
    isLoading: boolean;
    error: string | null;
    selectArtist: (artist: Artist) => void;
    clearArtist: () => void;
    refreshStats: () => Promise<void>;
}

const useArtistStore = create<ArtistStoreType>((set, get) => ({
    selectedArtist: null,
    artistStats: null,
    isLoading: false,
    error: null,
    selectArtist: (artist: Artist) => set({ selectedArtist: artist }),
    clearArtist: () => set({ selectedArtist: null }),
    refreshStats: async () => {

    }
}))

export default useArtistStore;