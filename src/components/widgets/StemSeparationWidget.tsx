import React, { useState, useEffect, useRef } from "react";
import { Mic, Upload, Loader, AlertCircle, Music2, Download, Play, Pause, FileAudio, Layers, Volume2, Zap } from "lucide-react";

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

interface AudioPlayerState {
  [key: string]: boolean;
}

const stemInfo: Record<string, { icon: React.ReactNode; color: string; label: string; gradient: string }> = {
  vocals: { 
    icon: <Mic className="h-4 w-4" />, 
    color: 'purple',
    label: 'Vocals',
    gradient: 'from-purple-500 to-pink-500'
  },
  bass: { 
    icon: <Music2 className="h-4 w-4" />, 
    color: 'blue',
    label: 'Bass',
    gradient: 'from-blue-500 to-cyan-500'
  },
  drums: { 
    icon: <Music2 className="h-4 w-4" />, 
    color: 'green',
    label: 'Drums',
    gradient: 'from-green-500 to-emerald-500'
  },
  guitars: { 
    icon: <Music2 className="h-4 w-4" />, 
    color: 'orange',
    label: 'Guitars',
    gradient: 'from-orange-500 to-yellow-500'
  },
  other: { 
    icon: <Music2 className="h-4 w-4" />, 
    color: 'gray',
    label: 'Other',
    gradient: 'from-gray-500 to-slate-500'
  },
};

export default function StemSeparationWidget() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stemWorkflow, setStemWorkflow] = useState<Workflow | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playingStates, setPlayingStates] = useState<AudioPlayerState>({});
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

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

  // Set first stem as active when results arrive
  useEffect(() => {
    if (result) {
      const firstStem = Object.keys(result).find(key => isAudioFile(key));
      if (firstStem) setActiveTab(firstStem);
    }
  }, [result]);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/musicai/workflows');
      if (!response.ok) throw new Error('Failed to fetch workflows');
      const data = await response.json();
      setWorkflows(data.workflows);
      
      // Find stem separation workflow
      const stemSeparationWorkflow = data.workflows.find((w: Workflow) => 
        w.name.toLowerCase().includes('stem') || 
        w.name.toLowerCase().includes('vocal') ||
        w.name.toLowerCase().includes('separation') ||
        w.description.toLowerCase().includes('stem') ||
        w.description.toLowerCase().includes('vocal')
      );
      setStemWorkflow(stemSeparationWorkflow || null);
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
      setJobId(null);
      setJobStatus(null);
      setPlayingStates({});
      setActiveTab(null);
    }
  };

  const uploadAndProcess = async () => {
    if (!uploadFile || !stemWorkflow) return;

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
          name: `Stem separation for ${uploadFile.name}`,
          workflow: stemWorkflow.slug,
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
      } else if (job.status === 'FAILED') {
        setError(job.error?.message || 'Job failed');
        setProcessing(false);
      }
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const togglePlayPause = (stemKey: string) => {
    const audio = audioRefs.current[stemKey];
    if (!audio) return;

    if (playingStates[stemKey]) {
      audio.pause();
    } else {
      // Pause all other audios
      Object.keys(audioRefs.current).forEach(key => {
        if (key !== stemKey && audioRefs.current[key]) {
          audioRefs.current[key].pause();
        }
      });
      audio.play();
    }
    
    setPlayingStates(prev => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [stemKey]: !prev[stemKey]
    }));
  };

  const isAudioFile = (key: string) => {
    return !key.toLowerCase().includes('original');
  };

  const reset = () => {
    setResult(null);
    setJobId(null);
    setJobStatus(null);
    setUploadFile(null);
    setPlayingStates({});
    setActiveTab(null);
  };

  const statusMessage = {
    'QUEUED': 'Waiting in queue...',
    'STARTED': 'Separating stems...',
  }[jobStatus || ''] || 'Processing...';

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl overflow-hidden">
      {/* Modern Header with Glass Effect */}
      <div className="relative z-10 px-5 py-4 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-2.5 rounded-xl">
                <Layers className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Stem Separation</h3>
              <p className="text-white/70 text-xs">AI-powered audio splitting</p>
            </div>
          </div>
          {result && (
            <button
              onClick={reset}
              className="px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200 backdrop-blur-sm"
            >
              New Track
            </button>
          )}
        </div>
      </div>

      {!stemWorkflow ? (
        <div className="flex-1 flex items-center justify-center p-5">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-white/60 mx-auto mb-4" />
            <p className="text-white/80 text-lg">Service Unavailable</p>
            <p className="text-white/60 text-sm">Stem separation is currently offline</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Empty State / Upload */}
          {!uploadFile && !processing && !result && (
            <div className="flex-1 flex items-center justify-center p-5">
              <div className="w-full max-w-sm mx-auto text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-50"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-full inline-block">
                    <Zap className="h-10 w-10 text-white" />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-2">Split Any Track</h2>
                <p className="text-white/70 mb-6 text-sm leading-relaxed">
                  Upload your audio and watch AI separate vocals, instruments, and more
                </p>
                
                <label className="block">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-2 border-dashed border-white/30 rounded-2xl p-6 transition-all duration-300 backdrop-blur-sm">
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
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                      <FileAudio className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">
                        {uploadFile.name}
                      </p>
                      <p className="text-white/70 text-sm">
                        {(uploadFile.size / 1024 / 1024).toFixed(1)} MB • Ready to process
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={uploadAndProcess}
                  disabled={uploading}
                  className="w-full relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 backdrop-blur-sm">
                    {uploading ? (
                      <div className="flex items-center justify-center gap-3">
                        <Loader className="h-4 w-4 animate-spin" />
                        Uploading...
                      </div>
                    ) : (
                      'Start Separation'
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
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-5 rounded-full inline-block">
                    <Loader className="h-10 w-10 text-white animate-spin" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {uploading ? 'Uploading...' : 'Processing Audio'}
                </h3>
                <p className="text-white/70 mb-4">{statusMessage}</p>
                <div className="w-48 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                </div>
                <p className="text-white/60 text-sm mt-3">
                  Usually takes 2-3 minutes
                </p>
              </div>
            </div>
          )}

          {/* Results - Modern Layout */}
          {result && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Stem Tabs */}
              <div className="px-4 py-3 bg-white/5 backdrop-blur-sm border-b border-white/10">
                <div className="flex gap-2 overflow-x-auto">
                  {Object.entries(result)
                    .filter(([key]) => isAudioFile(key))
                    .map(([key]) => {
                      const info = stemInfo[key.toLowerCase()] || stemInfo.other;
                      const isActive = activeTab === key;
                      
                      return (
                        <button
                          key={key}
                          onClick={() => setActiveTab(key)}
                          className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap backdrop-blur-sm ${
                            isActive
                              ? 'text-white'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {isActive && (
                            <div className={`absolute inset-0 bg-gradient-to-r ${info.gradient} rounded-xl opacity-90`}></div>
                          )}
                          <div className="relative flex items-center gap-2">
                            {info.icon}
                            {info.label}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Active Stem Player */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeTab && result[activeTab] && (
                  <>
                    {/* Player Card */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`bg-gradient-to-r ${stemInfo[activeTab.toLowerCase()]?.gradient || stemInfo.other.gradient} p-2.5 rounded-xl`}>
                            {stemInfo[activeTab.toLowerCase()]?.icon || stemInfo.other.icon}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">
                              {stemInfo[activeTab.toLowerCase()]?.label || activeTab}
                            </h3>
                            <p className="text-white/70 text-sm">Isolated track ready</p>
                          </div>
                        </div>
                        <button
                          onClick={() => togglePlayPause(activeTab)}
                          className="relative group"
                        >
                          <div className="absolute inset-0 bg-white/20 rounded-xl blur group-hover:bg-white/30 transition-colors"></div>
                          <div className="relative bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors backdrop-blur-sm">
                            {playingStates[activeTab] ? 
                              <Pause className="h-5 w-5 text-white" /> : 
                              <Play className="h-5 w-5 text-white" />
                            }
                          </div>
                        </button>
                      </div>
                      
                      <audio
                        ref={el => {
                          if (el) audioRefs.current[activeTab] = el;
                        }}
                        src={result[activeTab]}
                        onEnded={() => setPlayingStates(prev => ({ ...prev, [activeTab]: false }))}
                        className="w-full rounded-xl"
                        controls
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                    </div>

                    {/* Download Grid */}
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20">
                      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download Stems
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(result)
                          .filter(([key]) => isAudioFile(key))
                          .map(([key, url]) => {
                            const info = stemInfo[key.toLowerCase()] || stemInfo.other;
                            return (
                              <a
                                key={key}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group backdrop-blur-sm"
                              >
                                <div className={`bg-gradient-to-r ${info.gradient} p-2 rounded-lg`}>
                                  {info.icon}
                                </div>
                                <span className="text-white font-medium flex-1">
                                  {info.label}
                                </span>
                                <Download className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
                              </a>
                            );
                          })}
                      </div>
                    </div>
                  </>
                )}
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
                  Processing Failed
                </h3>
                <p className="text-white/70 mb-5 text-sm">
                  {error}
                </p>
                <button
                  onClick={reset}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 backdrop-blur-sm">
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