import React, { useState, useEffect, useRef } from "react";
import { Mic, Upload, Loader, CheckCircle, AlertCircle, Music2, Download, Play, Pause, FileAudio, Layers } from "lucide-react";

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

const stemInfo: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  vocals: { 
    icon: <Mic className="h-4 w-4" />, 
    color: 'purple',
    label: 'Vocals' 
  },
  bass: { 
    icon: <Music2 className="h-4 w-4" />, 
    color: 'blue',
    label: 'Bass' 
  },
  drums: { 
    icon: <Music2 className="h-4 w-4" />, 
    color: 'green',
    label: 'Drums' 
  },
  guitars: { 
    icon: <Music2 className="h-4 w-4" />, 
    color: 'orange',
    label: 'Guitars' 
  },
  other: { 
    icon: <Music2 className="h-4 w-4" />, 
    color: 'gray',
    label: 'Other' 
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

  const getStemColor = (key: string) => {
    const colors: Record<string, string> = {
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400',
    };
    return colors[stemInfo[key.toLowerCase()]?.color || 'gray'];
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded">
              <Mic className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Stem Separation</h3>
          </div>
          {result && (
            <button
              onClick={reset}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              New Separation
            </button>
          )}
        </div>
      </div>

      {!stemWorkflow ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Stem separation not available</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          {/* Empty State / Upload */}
          {!uploadFile && !processing && !result && (
            <div className="h-full flex items-center justify-center p-6">
              <div className="w-full">
                <div className="text-center mb-6">
                  <Layers className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    AI-Powered Stem Separation
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Split any song into individual instruments
                  </p>
                </div>
                
                <label className="block">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-8 hover:border-purple-400 dark:hover:border-purple-600 transition-colors cursor-pointer bg-white/50 dark:bg-gray-900/50">
                    <Upload className="h-12 w-12 text-purple-400 mx-auto mb-3" />
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
                    <FileAudio className="h-12 w-12 text-purple-600 dark:text-purple-400" />
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
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Separate Stems'}
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
                    <Loader className="h-20 w-20 text-purple-600 dark:text-purple-400 animate-spin" />
                  </div>
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {uploading ? 'Uploading file...' : statusMessage}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This usually takes 2-3 minutes
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="h-full flex flex-col">
              {/* Stem Tabs */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
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
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                            isActive
                              ? getStemColor(key)
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {info.icon}
                          {info.label}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Active Stem Player */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab && result[activeTab] && (
                  <div className="space-y-4">
                    {/* Player Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                      <div className={`p-5 ${getStemColor(activeTab)}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {stemInfo[activeTab.toLowerCase()]?.icon || stemInfo.other.icon}
                            <h4 className="text-lg font-semibold">
                              {stemInfo[activeTab.toLowerCase()]?.label || activeTab}
                            </h4>
                          </div>
                          <button
                            onClick={() => togglePlayPause(activeTab)}
                            className="p-3 bg-white/20 dark:bg-black/20 rounded-full hover:bg-white/30 dark:hover:bg-black/30 transition-colors"
                          >
                            {playingStates[activeTab] ? 
                              <Pause className="h-5 w-5" /> : 
                              <Play className="h-5 w-5" />
                            }
                          </button>
                        </div>
                      </div>
                      <div className="p-5">
                        <audio
                          ref={el => {
                            if (el) audioRefs.current[activeTab] = el;
                          }}
                          src={result[activeTab]}
                          onEnded={() => setPlayingStates(prev => ({ ...prev, [activeTab]: false }))}
                          className="w-full h-12"
                          controls
                        />
                      </div>
                    </div>

                    {/* Download All */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Download Stems
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(result)
                          .filter(([key]) => isAudioFile(key))
                          .map(([key, url]) => (
                            <a
                              key={key}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                              {stemInfo[key.toLowerCase()]?.icon || stemInfo.other.icon}
                              <span className="text-sm font-medium flex-1">
                                {stemInfo[key.toLowerCase()]?.label || key}
                              </span>
                              <Download className="h-4 w-4 text-gray-400" />
                            </a>
                          ))}
                      </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Tip:</strong> Use these stems for remixing, karaoke, or practice!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center w-full">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Separation Failed
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {error}
                </p>
                <button
                  onClick={reset}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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