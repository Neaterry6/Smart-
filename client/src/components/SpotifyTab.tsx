import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Music, Play, Pause, FastForward, Disc, SkipForward, Sparkles, Volume2, VolumeX } from "lucide-react";

// Types for Spotify API responses
interface Playlist {
  id: string;
  name: string;
  description: string;
  image: string | null;
  trackCount: number;
  externalUrl: string | null;
  owner: string | null;
}

interface Track {
  id: string;
  name: string;
  artists: string;
  album: string;
  duration: number;
  previewUrl: string | null;
  externalUrl: string | null;
  image: string | null;
}

interface PlaylistResponse {
  mood: string;
  playlists: Playlist[];
}

interface PlaylistDetails {
  id: string;
  name: string;
  description: string;
  image: string | null;
  trackCount: number;
  externalUrl: string | null;
  owner: string | null;
  tracks: Track[];
}

interface RecommendationsResponse {
  subject: string;
  mood: string;
  tracks: Track[];
}

type StudyMood = 'focus' | 'relax' | 'energize' | 'ambient' | 'classical';

const defaultImage = 'https://via.placeholder.com/300x300?text=No+Image';

export default function SpotifyTab() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('playlists');
  const [loading, setLoading] = useState<boolean>(false);
  const [mood, setMood] = useState<StudyMood>('focus');
  const [subject, setSubject] = useState<string>('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistDetails | null>(null);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState<boolean>(false);

  // Fetch playlists based on selected mood
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/spotify/playlists/${mood}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }
      
      const data: PlaylistResponse = await response.json();
      setPlaylists(data.playlists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: "Error",
        description: "Failed to fetch playlists. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch playlist details with tracks
  const fetchPlaylistDetails = async (playlistId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/spotify/playlist/${playlistId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlist details');
      }
      
      const data: PlaylistDetails = await response.json();
      setSelectedPlaylist(data);
    } catch (error) {
      console.error('Error fetching playlist details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch playlist details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommendations based on subject and mood
  const fetchRecommendations = async () => {
    if (!subject.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a study subject to get recommendations.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/spotify/recommendations?subject=${encodeURIComponent(subject)}&mood=${mood}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data: RecommendationsResponse = await response.json();
      setRecommendations(data.tracks);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'playlists') {
      fetchPlaylists();
    }
  };

  // Handle playlist selection
  const handlePlaylistSelect = (playlist: Playlist) => {
    fetchPlaylistDetails(playlist.id);
  };

  // Play a track
  const playTrack = (track: Track) => {
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    
    if (track.previewUrl) {
      const newAudio = new Audio(track.previewUrl);
      newAudio.volume = muted ? 0 : 0.7;
      
      newAudio.addEventListener('ended', () => {
        setIsPlaying(false);
        
        // Play next track if available
        if (selectedPlaylist) {
          const currentIndex = selectedPlaylist.tracks.findIndex(t => t.id === track.id);
          const nextIndex = currentIndex + 1;
          
          if (nextIndex < selectedPlaylist.tracks.length) {
            const nextTrack = selectedPlaylist.tracks[nextIndex];
            if (nextTrack.previewUrl) {
              setCurrentTrack(nextTrack);
              playTrack(nextTrack);
            }
          }
        } else if (recommendations.length > 0) {
          const currentIndex = recommendations.findIndex(t => t.id === track.id);
          const nextIndex = currentIndex + 1;
          
          if (nextIndex < recommendations.length) {
            const nextTrack = recommendations[nextIndex];
            if (nextTrack.previewUrl) {
              setCurrentTrack(nextTrack);
              playTrack(nextTrack);
            }
          }
        }
      });
      
      newAudio.play().then(() => {
        setIsPlaying(true);
        setCurrentTrack(track);
        setAudio(newAudio);
      }).catch(error => {
        console.error('Error playing track:', error);
        toast({
          title: "Playback Error",
          description: "Failed to play this track. Please try another one.",
          variant: "destructive",
        });
      });
    } else {
      toast({
        title: "Preview Unavailable",
        description: "No preview available for this track.",
        variant: "destructive",
      });
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audio || !currentTrack) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  // Skip to next track
  const skipToNext = () => {
    if (!currentTrack) return;
    
    if (selectedPlaylist) {
      const currentIndex = selectedPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % selectedPlaylist.tracks.length;
      const nextTrack = selectedPlaylist.tracks[nextIndex];
      
      if (nextTrack.previewUrl) {
        playTrack(nextTrack);
      } else {
        // Try to find the next track with a preview URL
        for (let i = 1; i < selectedPlaylist.tracks.length; i++) {
          const index = (nextIndex + i) % selectedPlaylist.tracks.length;
          if (selectedPlaylist.tracks[index].previewUrl) {
            playTrack(selectedPlaylist.tracks[index]);
            break;
          }
        }
      }
    } else if (recommendations.length > 0) {
      const currentIndex = recommendations.findIndex(t => t.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % recommendations.length;
      const nextTrack = recommendations[nextIndex];
      
      if (nextTrack.previewUrl) {
        playTrack(nextTrack);
      } else {
        // Try to find the next track with a preview URL
        for (let i = 1; i < recommendations.length; i++) {
          const index = (nextIndex + i) % recommendations.length;
          if (recommendations[index].previewUrl) {
            playTrack(recommendations[index]);
            break;
          }
        }
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audio) return;
    
    if (muted) {
      audio.volume = 0.7;
      setMuted(false);
    } else {
      audio.volume = 0;
      setMuted(true);
    }
  };

  // Format duration from milliseconds to MM:SS
  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  // Fetch playlists on initial load
  useEffect(() => {
    if (activeTab === 'playlists') {
      fetchPlaylists();
    }
  }, [mood, activeTab]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Music className="h-8 w-8 mr-2 text-primary" />
        <h2 className="text-2xl font-bold">Study Music</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="playlists">Curated Playlists</TabsTrigger>
          <TabsTrigger value="recommendations">Custom Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="playlists" className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <Label htmlFor="mood-select" className="whitespace-nowrap">Select Mood:</Label>
            <Select value={mood} onValueChange={(value: StudyMood) => setMood(value)}>
              <SelectTrigger id="mood-select" className="w-[180px]">
                <SelectValue placeholder="Select mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="focus">Focus</SelectItem>
                <SelectItem value="relax">Relax</SelectItem>
                <SelectItem value="energize">Energize</SelectItem>
                <SelectItem value="ambient">Ambient</SelectItem>
                <SelectItem value="classical">Classical</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchPlaylists} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
          
          {selectedPlaylist ? (
            <div>
              <Button 
                variant="outline" 
                onClick={() => setSelectedPlaylist(null)} 
                className="mb-4"
              >
                Back to playlists
              </Button>
              
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img 
                      src={selectedPlaylist.image || defaultImage} 
                      alt={selectedPlaylist.name} 
                      className="w-full h-full object-cover rounded-md" 
                    />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{selectedPlaylist.name}</CardTitle>
                    <CardDescription>
                      {selectedPlaylist.description || 'No description available'}
                    </CardDescription>
                    <div className="text-sm mt-1">
                      By {selectedPlaylist.owner} • {selectedPlaylist.trackCount} tracks
                    </div>
                    {selectedPlaylist.externalUrl && (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-sm text-blue-500" 
                        onClick={() => window.open(selectedPlaylist.externalUrl || '', '_blank')}
                      >
                        Open in Spotify
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
              
              <div className="space-y-2">
                {selectedPlaylist.tracks.map(track => (
                  <Card 
                    key={track.id} 
                    className={`cursor-pointer hover:bg-accent transition-colors ${
                      currentTrack?.id === track.id ? 'border-primary' : ''
                    }`}
                    onClick={() => playTrack(track)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 flex-shrink-0">
                        {currentTrack?.id === track.id ? (
                          <div className="w-full h-full bg-primary rounded-full flex items-center justify-center">
                            {isPlaying ? (
                              <Pause className="h-5 w-5 text-primary-foreground" />
                            ) : (
                              <Play className="h-5 w-5 text-primary-foreground" />
                            )}
                          </div>
                        ) : (
                          <img 
                            src={track.image || defaultImage} 
                            alt={track.name} 
                            className="w-full h-full object-cover rounded-full" 
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{track.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{track.artists}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(track.duration)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map(playlist => (
                <Card 
                  key={playlist.id} 
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handlePlaylistSelect(playlist)}
                >
                  <CardContent className="pt-6">
                    <div className="aspect-square mb-4">
                      <img 
                        src={playlist.image || defaultImage} 
                        alt={playlist.name} 
                        className="w-full h-full object-cover rounded-md" 
                      />
                    </div>
                    <CardTitle className="text-lg mb-1 truncate">{playlist.name}</CardTitle>
                    <CardDescription className="line-clamp-2 h-10">
                      {playlist.description || 'No description available'}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground">
                    {playlist.trackCount} tracks
                  </CardFooter>
                </Card>
              ))}
              
              {playlists.length === 0 && !loading && (
                <div className="col-span-full text-center py-12">
                  <Disc className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No playlists found</p>
                  <p className="text-muted-foreground mb-4">Try selecting a different mood or check your network connection.</p>
                  <Button onClick={fetchPlaylists}>Retry</Button>
                </div>
              )}
              
              {loading && (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-lg font-medium">Loading playlists...</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="subject-input" className="mb-2 block">Study Subject:</Label>
              <Input 
                id="subject-input" 
                placeholder="e.g. Quantum Physics, World History, Mathematics" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="rec-mood-select" className="mb-2 block">Mood:</Label>
              <Select value={mood} onValueChange={(value: StudyMood) => setMood(value)}>
                <SelectTrigger id="rec-mood-select" className="w-[180px]">
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="focus">Focus</SelectItem>
                  <SelectItem value="relax">Relax</SelectItem>
                  <SelectItem value="energize">Energize</SelectItem>
                  <SelectItem value="ambient">Ambient</SelectItem>
                  <SelectItem value="classical">Classical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="self-end">
              <Button onClick={fetchRecommendations} disabled={loading}>
                {loading ? "Loading..." : "Get Recommendations"}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            {recommendations.map(track => (
              <Card 
                key={track.id} 
                className={`cursor-pointer hover:bg-accent transition-colors ${
                  currentTrack?.id === track.id ? 'border-primary' : ''
                }`}
                onClick={() => playTrack(track)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 flex-shrink-0">
                    {currentTrack?.id === track.id ? (
                      <div className="w-full h-full bg-primary rounded-full flex items-center justify-center">
                        {isPlaying ? (
                          <Pause className="h-5 w-5 text-primary-foreground" />
                        ) : (
                          <Play className="h-5 w-5 text-primary-foreground" />
                        )}
                      </div>
                    ) : (
                      <img 
                        src={track.image || defaultImage} 
                        alt={track.name} 
                        className="w-full h-full object-cover rounded-full" 
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{track.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{track.artists}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDuration(track.duration)}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {recommendations.length === 0 && !loading && (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No recommendations yet</p>
                <p className="text-muted-foreground mb-4">Enter your study subject and select a mood to get personalized music recommendations.</p>
              </div>
            )}
            
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-lg font-medium">Finding the perfect study music...</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Audio player controls */}
      {currentTrack && (
        <Card className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-4xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0">
                <img 
                  src={currentTrack.image || defaultImage} 
                  alt={currentTrack.name} 
                  className="w-full h-full object-cover rounded-md" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{currentTrack.name}</div>
                <div className="text-sm text-muted-foreground truncate">{currentTrack.artists}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMute}
                  className="rounded-full"
                >
                  {muted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                  <span className="sr-only">{muted ? "Unmute" : "Mute"}</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={togglePlayPause}
                  className="rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                  <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={skipToNext}
                  className="rounded-full"
                >
                  <SkipForward className="h-5 w-5" />
                  <span className="sr-only">Next</span>
                </Button>
                {currentTrack.externalUrl && (
                  <Button 
                    variant="ghost" 
                    className="text-xs" 
                    onClick={() => window.open(currentTrack.externalUrl || '', '_blank')}
                  >
                    Open in Spotify
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}