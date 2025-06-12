import axios, { AxiosInstance } from 'axios';

interface UploadUrls {
  uploadUrl: string;
  downloadUrl: string;
}

interface WorkflowParam {
  inputUrl: string;
  [key: string]: any;
}

interface Job {
  id: string;
  app: string;
  workflow: string;
  status: 'QUEUED' | 'STARTED' | 'SUCCEEDED' | 'FAILED';
  batchName?: string | null;
  workflowParams: WorkflowParam;
  metadata?: Record<string, any>;
  result?: Record<string, string> | null;
  error?: {
    code: string;
    title: string;
    message: string;
  } | null;
  name: string;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
}

interface Workflow {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export class MusicAIService {
  private api: AxiosInstance;

  constructor(apiKey: string) {
    this.api = axios.create({
      baseURL: 'https://api.music.ai/v1',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async getUploadUrls(): Promise<UploadUrls> {
    try {
      const response = await this.api.get('/upload');
      return response.data;
    } catch (error: any) {
      console.error('Error getting upload URLs:', error);
      throw new Error(error.response?.data?.error || 'Failed to get upload URLs');
    }
  }

  async getWorkflows(page: number = 0, size: number = 100): Promise<{ workflows: Workflow[] }> {
    try {
      const response = await this.api.get('/workflow', {
        params: { page, size },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching workflows:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch workflows');
    }
  }

  async createJob(params: {
    name: string;
    workflow: string;
    params: WorkflowParam;
    metadata?: Record<string, any>;
  }): Promise<{ id: string }> {
    try {
      const response = await this.api.post('/job', params);
      return response.data;
    } catch (error: any) {
      console.error('Error creating job:', error);
      throw new Error(error.response?.data?.error || 'Failed to create job');
    }
  }

  async getJob(id: string): Promise<Job> {
    try {
      const response = await this.api.get(`/job/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching job:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch job');
    }
  }

  async getJobStatus(id: string): Promise<{ id: string; status: string }> {
    try {
      const response = await this.api.get(`/job/${id}/status`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching job status:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch job status');
    }
  }

  async getJobs(params?: {
    status?: string[];
    workflow?: string[];
    batchName?: string;
    page?: number;
    size?: number;
  }): Promise<Job[]> {
    try {
      const response = await this.api.get('/job', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch jobs');
    }
  }

  async deleteJob(id: string): Promise<{ id: string }> {
    try {
      const response = await this.api.delete(`/job/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting job:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete job');
    }
  }
}

// Create singleton instance
let musicAIService: MusicAIService | null = null;

export function initializeMusicAIService(apiKey: string): MusicAIService {
  if (!musicAIService) {
    musicAIService = new MusicAIService(apiKey);
  }
  return musicAIService;
}

export function getMusicAIService(): MusicAIService | null {
  return musicAIService;
} 