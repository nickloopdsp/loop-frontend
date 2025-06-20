import React, { useState, useEffect, useRef } from "react";
import { Music, Upload, Loader, AlertCircle, Download, Play, Pause, FileAudio, Sparkles, Clock, Key, BarChart3, Zap, Music2 } from "lucide-react";

interface Workflow {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface Job {
  id: string;
  status: 'QUEUED' | 'STARTED' | 'SUCCEEDED' | 'FAILED';
  result?: Record<string, string>;
  error?: {
    code: string;
    title: string;
    message: string;
  };
}

interface ChordData {
  chords?: Array<{
    time: number;
    chord: string;
    confidence?: number;
  }>;
  key?: string;
  scale?: string;
  bpm?: number;
}

export default function GenerateChordsWidget() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [chordsWorkflow, setChordsWorkflow] = useState<Workflow | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [chordData, setChordData] = useState<ChordData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch workflows on mount
  useEffect(() => {
    fetchWorkflows();
  }, []);

  // Poll job status when jobId is set
  useEffect(() => {
    if (jobId && jobStatus && !['SUCCEEDED', 'FAILED'].includes(jobStatus)) {
      const interval = setInterval(() => {
        checkJobStatus(jobId);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [jobId, jobStatus]);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/musicai/workflows');
      if (!response.ok) throw new Error('Failed to fetch workflows');
      const data = await response.json();
      setWorkflows(data.workflows);
      
      // Find chord generation workflow - prefer the one with audio output
      const chordWorkflow = data.workflows.find((w: Workflow) => 
        w.name.toLowerCase().includes('chord') && 
        (w.name.toLowerCase().includes('beat') || w.name.toLowerCase().includes('mapping'))
      ) || data.workflows.find((w: Workflow) => 
        w.name.toLowerCase().includes('chord') || 
        w.description.toLowerCase().includes('chord')
      );
      setChordsWorkflow(chordWorkflow || null);
    } catch (err) {
      console.error('Error fetching workflows:', err);
      setError('Failed to load workflows');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setError(null);
      setResult(null);
      setChordData(null);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const uploadAndProcess = async () => {
    if (!uploadFile || !chordsWorkflow) return;

    setUploading(true);
    setError(null);
    
    try {
      // Get upload URLs
      const uploadResponse = await fetch('/api/musicai/upload');
      if (!uploadResponse.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, downloadUrl } = await uploadResponse.json();

      // Upload file
      const uploadResult = await fetch(uploadUrl, {
        method: 'PUT',
        body: uploadFile,
        headers: {
          'Content-Type': uploadFile.type || 'audio/mpeg',
        },
      });

      if (!uploadResult.ok) throw new Error('Failed to upload file');

      setUploading(false);
      setProcessing(true);

      // Create job
      const jobResponse = await fetch('/api/musicai/job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Analyze chords for ${uploadFile.name}`,
          workflow: chordsWorkflow.slug,
          params: {
            inputUrl: downloadUrl,
          },
        }),
      });

      if (!jobResponse.ok) throw new Error('Failed to create job');
      const { id } = await jobResponse.json();
      
      setJobId(id);
      setJobStatus('QUEUED');
      
    } catch (err: any) {
      setError(err.message);
      setUploading(false);
      setProcessing(false);
    }
  };

  const checkJobStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/musicai/job/${id}`);
      if (!response.ok) throw new Error('Failed to check job status');
      
      const job: Job = await response.json();
      setJobStatus(job.status);

      if (job.status === 'SUCCEEDED' && job.result) {
        setResult(job.result);
        setProcessing(false);
        
        // Try to fetch and parse chord data from JSON results
        const jsonUrl = Object.entries(job.result).find(([key]) => 
          key.toLowerCase().includes('chord') || 
          key.toLowerCase().includes('json') ||
          key.toLowerCase().includes('transcription')
        )?.[1];
        
        if (jsonUrl) {
          try {
            const chordResponse = await fetch(jsonUrl);
            const data = await chordResponse.json();
            setChordData(data);
          } catch (err) {
            console.error('Failed to parse chord data:', err);
          }
        }
      } else if (job.status === 'FAILED') {
        setError(job.error?.message || 'Job failed');
        setProcessing(false);
      }
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const getCurrentChord = () => {
    if (!chordData?.chords || chordData.chords.length === 0) return null;
    
    // Find the chord at current time
    for (let i = chordData.chords.length - 1; i >= 0; i--) {
      if (currentTime >= chordData.chords[i].time) {
        return chordData.chords[i].chord;
      }
    }
    return chordData.chords[0].chord;
  };

  const reset = () => {
    setResult(null);
    setJobId(null);
    setJobStatus(null);
    setUploadFile(null);
    setChordData(null);
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current?.src) {
      URL.revokeObjectURL(audioRef.current.src);
    }
  };

  // Original audio URL if uploaded file is available
  const originalAudioUrl = uploadFile ? URL.createObjectURL(uploadFile) : null;

  const statusMessage = {
    'QUEUED': 'Waiting in queue...',
    'STARTED': 'Analyzing your audio...',
  }[jobStatus || ''] || 'Processing...';

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-2xl overflow-hidden">
      {/* Modern Header with Glass Effect */}
      <div className="relative z-10 px-5 py-4 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 p-2.5 rounded-xl">
                <Music className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Chord Analysis</h3>
              <p className="text-white/70 text-xs">AI-powered chord detection</p>
            </div>
          </div>
          {result && (
            <button
              onClick={reset}
              className="px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200 backdrop-blur-sm"
            >
              New Song
            </button>
          )}
        </div>
      </div>

      {!chordsWorkflow ? (
        <div className="flex-1 flex items-center justify-center p-5">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-white/60 mx-auto mb-4" />
            <p className="text-white/80 text-lg">Service Unavailable</p>
            <p className="text-white/60 text-sm">Chord analysis is currently offline</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Empty State / Upload */}
          {!uploadFile && !processing && !result && (
            <div className="flex-1 flex items-center justify-center p-5">
              <div className="w-full max-w-sm mx-auto text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-xl opacity-50"></div>
                  <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 p-5 rounded-full inline-block">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-2">Analyze Chords</h2>
                <p className="text-white/70 mb-6 text-sm leading-relaxed">
                  Upload any song and instantly see its chord progression in real-time
                </p>
                
                <label className="block">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-2 border-dashed border-white/30 rounded-2xl p-6 transition-all duration-300 backdrop-blur-sm">
                      <Upload className="h-8 w-8 text-white mx-auto mb-3" />
                      <p className="text-white font-semibold mb-1">
                        Drop your audio file here
                      </p>
                      <p className="text-white/80 text-xs">
                        Supports MP3, WAV, M4A • Max 50MB
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* File Selected */}
          {uploadFile && !processing && !result && (
            <div className="flex-1 flex items-center justify-center p-5">
              <div className="w-full max-w-sm mx-auto">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 mb-5 border border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl">
                      <FileAudio className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">
                        {uploadFile.name}
                      </p>
                      <p className="text-white/70 text-sm">
                        {(uploadFile.size / 1024 / 1024).toFixed(1)} MB • Ready to analyze
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={uploadAndProcess}
                  disabled={uploading}
                  className="w-full relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 backdrop-blur-sm">
                    {uploading ? (
                      <div className="flex items-center justify-center gap-3">
                        <Loader className="h-4 w-4 animate-spin" />
                        Uploading...
                      </div>
                    ) : (
                      'Start Analysis'
                    )}
                  </div>
                </button>
                
                <button
                  onClick={() => setUploadFile(null)}
                  className="w-full mt-3 text-white/70 hover:text-white text-sm transition-colors"
                >
                  Choose different file
                </button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {(uploading || processing) && (
            <div className="flex-1 flex items-center justify-center p-5">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 p-5 rounded-full inline-block">
                    <Loader className="h-10 w-10 text-white animate-spin" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {uploading ? 'Uploading...' : 'Analyzing Audio'}
                </h3>
                <p className="text-white/70 mb-4">{statusMessage}</p>
                <div className="w-48 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-pulse"></div>
                </div>
                <p className="text-white/60 text-sm mt-3">
                  Usually takes 30-60 seconds
                </p>
              </div>
            </div>
          )}

          {/* Results - Modern Layout */}
          {result && chordData && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Now Playing Chord - Prominent Display */}
              {originalAudioUrl && getCurrentChord() && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                        <Music2 className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-white/80 text-xs">Now Playing</span>
                        <div className="text-xl font-bold">{getCurrentChord()}</div>
                      </div>
                    </div>
                    <span className="text-white/90 font-mono">
                      {formatTime(currentTime)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Audio Player */}
                {originalAudioUrl && (
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2.5 rounded-xl">
                        <Play className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Audio Player</h3>
                        <p className="text-white/70 text-sm">Follow along with chord changes</p>
                      </div>
                    </div>
                    <audio
                      ref={audioRef}
                      src={originalAudioUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={() => setIsPlaying(false)}
                      className="w-full rounded-xl"
                      controls
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                  </div>
                )}

                {/* Song Info Cards */}
                {(chordData.key || chordData.bpm || result["root key"] || result["BPM"]) && (
                  <div className="grid grid-cols-2 gap-3">
                    {(chordData.key || result["root key"]) && (
                      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 p-1.5 rounded-lg">
                            <Key className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-white/80 text-xs font-medium">Musical Key</span>
                        </div>
                        <p className="text-white font-bold text-lg">
                          {chordData.key || result["root key"]} {chordData.scale}
                        </p>
                      </div>
                    )}
                    {(chordData.bpm || result["BPM"]) && (
                      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-gradient-to-r from-orange-400 to-red-400 p-1.5 rounded-lg">
                            <BarChart3 className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-white/80 text-xs font-medium">Tempo</span>
                        </div>
                        <p className="text-white font-bold text-lg">
                          {chordData.bpm ? Math.round(chordData.bpm) : result["BPM"]} BPM
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Chord Progression */}
                {chordData.chords && chordData.chords.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-gradient-to-r from-blue-400 to-indigo-400 p-1.5 rounded-lg">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="text-white font-semibold">Chord Progression</h4>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {chordData.chords.slice(0, 12).map((item, idx) => {
                        const isActive = currentTime >= item.time && 
                          (idx === chordData.chords!.length - 1 || currentTime < chordData.chords![idx + 1].time);
                        
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-300 ${
                              isActive 
                                ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-indigo-400/50 backdrop-blur-sm' 
                                : 'bg-white/5 hover:bg-white/10 backdrop-blur-sm'
                            }`}
                          >
                            <span className="text-white/70 text-xs font-mono w-10">
                              {formatTime(item.time)}
                            </span>
                            <span className={`font-bold ${
                              isActive 
                                ? 'text-white' 
                                : 'text-white/90'
                            }`}>
                              {item.chord}
                            </span>
                            {isActive && (
                              <div className="ml-auto">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {chordData.chords.length > 12 && (
                        <div className="text-white/60 text-xs text-center py-2">
                          +{chordData.chords.length - 12} more chords...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Export Options */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-1.5 rounded-lg">
                      <Download className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-white font-semibold">Export Data</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(result)
                      .filter(([key]) => !["root key", "BPM"].includes(key))
                      .map(([key, url]) => (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group backdrop-blur-sm"
                        >
                          <Download className="h-3 w-3 text-white/70 group-hover:text-white transition-colors" />
                          <span className="text-white/90 font-medium text-xs truncate">
                            {key.replace(/_/g, ' ')}
                          </span>
                        </a>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex-1 flex items-center justify-center p-5">
              <div className="text-center max-w-sm">
                <div className="bg-red-500/20 p-5 rounded-full inline-block mb-5 backdrop-blur-sm">
                  <AlertCircle className="h-10 w-10 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Analysis Failed
                </h3>
                <p className="text-white/70 mb-5 text-sm">
                  {error}
                </p>
                <button
                  onClick={reset}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 backdrop-blur-sm">
                    Try Again
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 