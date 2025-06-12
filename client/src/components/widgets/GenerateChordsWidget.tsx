import React, { useState, useEffect, useRef } from "react";
import { Music, Upload, Loader, CheckCircle, AlertCircle, Download, Play, Pause, FileAudio, Sparkles } from "lucide-react";

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
    <div className="h-full flex flex-col bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded">
              <Music className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Chord Analysis</h3>
          </div>
          {result && (
            <button
              onClick={reset}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              New Analysis
            </button>
          )}
        </div>
      </div>

      {!chordsWorkflow ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Chord analysis not available</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          {/* Empty State / Upload */}
          {!uploadFile && !processing && !result && (
            <div className="h-full flex items-center justify-center p-6">
              <div className="w-full">
                <div className="text-center mb-6">
                  <Sparkles className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    AI-Powered Chord Detection
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Upload any song to instantly see its chords
                  </p>
                </div>
                
                <label className="block">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg p-8 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors cursor-pointer bg-white/50 dark:bg-gray-900/50">
                    <Upload className="h-12 w-12 text-indigo-400 mx-auto mb-3" />
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300 text-center">
                      Drop audio file or click to browse
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                      MP3, WAV, M4A up to 50MB
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* File Selected */}
          {uploadFile && !processing && !result && (
            <div className="h-full flex items-center justify-center p-6">
              <div className="w-full">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <FileAudio className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                        {uploadFile.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(uploadFile.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={uploadAndProcess}
                  disabled={uploading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Start Analysis'}
                </button>
                
                <button
                  onClick={() => setUploadFile(null)}
                  className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Choose different file
                </button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {(uploading || processing) && (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="h-20 w-20 mx-auto">
                    <Loader className="h-20 w-20 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  </div>
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {uploading ? 'Uploading file...' : statusMessage}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This usually takes 30-60 seconds
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && chordData && (
            <div className="h-full flex flex-col">
              {/* Now Playing Bar */}
              {originalAudioUrl && getCurrentChord() && (
                <div className="bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm opacity-75">Now Playing:</span>
                      <span className="text-xl font-bold">{getCurrentChord()}</span>
                    </div>
                    <span className="text-sm font-mono">
                      {formatTime(currentTime)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Audio Player */}
                {originalAudioUrl && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <audio
                      ref={audioRef}
                      src={originalAudioUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={() => setIsPlaying(false)}
                      className="w-full h-12"
                      controls
                    />
                  </div>
                )}

                {/* Song Info */}
                {(chordData.key || chordData.bpm || result["root key"] || result["BPM"]) && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Song Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {(chordData.key || result["root key"]) && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Key</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {chordData.key || result["root key"]} {chordData.scale}
                          </p>
                        </div>
                      )}
                      {(chordData.bpm || result["BPM"]) && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Tempo</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {chordData.bpm ? Math.round(chordData.bpm) : result["BPM"]} BPM
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Chord Progression */}
                {chordData.chords && chordData.chords.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                      Full Chord Progression
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {chordData.chords.map((item, idx) => {
                        const isActive = currentTime >= item.time && 
                          (idx === chordData.chords!.length - 1 || currentTime < chordData.chords![idx + 1].time);
                        
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-4 py-2 px-3 rounded transition-colors ${
                              isActive 
                                ? 'bg-indigo-100 dark:bg-indigo-900/30' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                          >
                            <span className="text-sm text-gray-500 dark:text-gray-400 w-14 font-mono">
                              {formatTime(item.time)}
                            </span>
                            <span className={`text-base font-semibold ${
                              isActive 
                                ? 'text-indigo-600 dark:text-indigo-400' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {item.chord}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Export Options */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Export Data
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(result)
                      .filter(([key]) => !["root key", "BPM"].includes(key))
                      .map(([key, url]) => (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm bg-white dark:bg-gray-700 px-3 py-2 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          {key.replace(/_/g, ' ')}
                        </a>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center w-full">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Analysis Failed
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {error}
                </p>
                <button
                  onClick={reset}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 