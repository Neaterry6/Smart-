import SpotifyWebApi from 'spotify-web-api-node';
import dotenv from 'dotenv';

dotenv.config();

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://localhost:5000/callback'
});

// Refresh and obtain a new access token
async function refreshSpotifyToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    const accessToken = data.body['access_token'];
    spotifyApi.setAccessToken(accessToken);
    console.log('Spotify access token refreshed');
    return accessToken;
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    throw error;
  }
}

// Get token and set it on the API object
export async function initializeSpotify() {
  try {
    return await refreshSpotifyToken();
  } catch (error) {
    console.error('Failed to initialize Spotify API:', error);
    throw error;
  }
}

// Study mood types for playlist generation
export type StudyMood = 'focus' | 'relax' | 'energize' | 'ambient' | 'classical';

// Search for playlists based on study mood
export async function searchStudyPlaylists(mood: StudyMood, limit: number = 5): Promise<any[]> {
  try {
    // Ensure we have a valid token
    await refreshSpotifyToken();
    
    // Map mood to search query
    const queryMap = {
      focus: 'focus study concentration',
      relax: 'calm study relax',
      energize: 'energetic study motivation',
      ambient: 'ambient study background',
      classical: 'classical study piano'
    };
    
    const query = queryMap[mood];
    const response = await spotifyApi.searchPlaylists(query, { limit });
    return response.body.playlists?.items || [];
  } catch (error) {
    console.error(`Error searching for ${mood} playlists:`, error);
    throw error;
  }
}

// Get detailed information about a playlist
export async function getPlaylistDetails(playlistId: string): Promise<any> {
  try {
    // Ensure we have a valid token
    await refreshSpotifyToken();
    
    const response = await spotifyApi.getPlaylist(playlistId);
    return response.body;
  } catch (error) {
    console.error('Error getting playlist details:', error);
    throw error;
  }
}

// Get tracks from a playlist with limit
export async function getPlaylistTracks(playlistId: string, limit: number = 20): Promise<any[]> {
  try {
    // Ensure we have a valid token
    await refreshSpotifyToken();
    
    const response = await spotifyApi.getPlaylistTracks(playlistId, { limit });
    return response.body.items || [];
  } catch (error) {
    console.error('Error getting playlist tracks:', error);
    throw error;
  }
}

// Get recommendations based on seed tracks, artists, or genres
export async function getRecommendations(options: {
  seed_tracks?: string[];
  seed_artists?: string[];
  seed_genres?: string[];
  limit?: number;
  target_energy?: number;
  target_tempo?: number;
}): Promise<any[]> {
  try {
    // Ensure we have a valid token
    await refreshSpotifyToken();
    
    const response = await spotifyApi.getRecommendations(options);
    return response.body.tracks || [];
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}

// Map study subject to recommended genres for better recommendations
export function mapSubjectToGenres(subject: string): string[] {
  const subjectGenreMap: Record<string, string[]> = {
    math: ['electronic', 'ambient', 'classical'],
    science: ['electronic', 'ambient', 'classical'],
    history: ['classical', 'acoustic', 'folk'],
    literature: ['classical', 'acoustic', 'folk'],
    computer: ['electronic', 'techno', 'ambient'],
    language: ['pop', 'acoustic', 'world-music'],
    art: ['classical', 'jazz', 'ambient'],
    business: ['jazz', 'electronic', 'pop'],
    psychology: ['ambient', 'classical', 'electronic'],
    philosophy: ['classical', 'ambient', 'jazz'],
    default: ['study', 'focus', 'classical']
  };
  
  // Find matching subject or use default
  for (const key of Object.keys(subjectGenreMap)) {
    if (subject.toLowerCase().includes(key)) {
      return subjectGenreMap[key];
    }
  }
  
  return subjectGenreMap.default;
}

// Get recommended playlists based on study subject and mood
export async function getStudyPlaylistRecommendations(
  subject: string,
  mood: StudyMood,
  limit: number = 5
): Promise<any[]> {
  try {
    // Determine energy level based on mood
    const energyLevels: Record<StudyMood, number> = {
      focus: 0.5,
      relax: 0.3,
      energize: 0.8,
      ambient: 0.4,
      classical: 0.5
    };
    
    // Determine tempo based on mood
    const tempoLevels: Record<StudyMood, number> = {
      focus: 110,
      relax: 80,
      energize: 125,
      ambient: 90,
      classical: 100
    };
    
    // Get genres based on subject
    const genres = mapSubjectToGenres(subject);
    
    // Get recommendations
    return await getRecommendations({
      seed_genres: genres.slice(0, 2), // Spotify API allows max 5 seed values total
      limit,
      target_energy: energyLevels[mood],
      target_tempo: tempoLevels[mood]
    });
  } catch (error) {
    console.error('Error getting study playlist recommendations:', error);
    throw error;
  }
}

export default {
  initializeSpotify,
  searchStudyPlaylists,
  getPlaylistDetails,
  getPlaylistTracks,
  getRecommendations,
  getStudyPlaylistRecommendations,
  mapSubjectToGenres
};