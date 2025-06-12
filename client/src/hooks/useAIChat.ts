import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { ChatMessage } from '@shared/schema';

interface AIContext {
  artistName?: string;
  artistStats?: any;
  [key: string]: any;
}

interface SendMessageOptions {
  conversationHistory?: ChatMessage[];
  context?: AIContext;
  onSuccess?: (response: string) => void;
  onError?: (error: Error) => void;
}

export function useAIChat() {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      message, 
      conversationHistory = [], 
      context = {} 
    }: { 
      message: string; 
      conversationHistory?: ChatMessage[]; 
      context?: AIContext;
    }) => {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory,
          context
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      return response.json();
    },
  });

  const sendMessage = useCallback(async (
    message: string,
    options?: SendMessageOptions
  ) => {
    try {
      setIsLoading(true);
      const result = await sendMessageMutation.mutateAsync({
        message,
        conversationHistory: options?.conversationHistory,
        context: options?.context,
      });

      options?.onSuccess?.(result.message);
      return result.message;
    } catch (error) {
      const err = error as Error;
      options?.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sendMessageMutation]);

  // Stream message function for future use
  const streamMessage = useCallback(async (
    message: string,
    options?: SendMessageOptions & {
      onChunk?: (chunk: string) => void;
    }
  ) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: options?.conversationHistory,
          context: options?.context
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to stream message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullMessage = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullMessage += parsed.content;
                  options?.onChunk?.(parsed.content);
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      options?.onSuccess?.(fullMessage);
      return fullMessage;
    } catch (error) {
      const err = error as Error;
      options?.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    streamMessage,
    isLoading,
    isError: sendMessageMutation.isError,
    error: sendMessageMutation.error,
  };
} 