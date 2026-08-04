import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type PolicySource = {
    title: string;
    page_number?: number | null;
    file_id?: number | null;
    file_url?: string | null;
    chunk_id?: number;
    score?: number;
    match_type?: string;
};

export type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
    sources?: PolicySource[];
};

export type AssistantResponse = {
    answer: string;
    history: ChatMessage[];
};

export const useAssistant = () => {
    const queryClient = useQueryClient();

    // 1. Fetch persistent history & config on mount
    const { data, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['assistant-history'],
        queryFn: async () => {
            const response = await client.get<{
                history: ChatMessage[],
                config: { model_name: string }
            }>(`${API_ENDPOINTS.SMART_CHAT}?context=admin`);
            return response.data;
        },
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const [history, setHistory] = useState<ChatMessage[]>([]);

    useEffect(() => {
        if (data?.history) {
            setHistory(data.history);
        }
    }, [data]);

    const [isStreaming, setIsStreaming] = useState(false);
    const [activeTool, setActiveTool] = useState<{ name: string; status: 'running' | 'completed' } | null>(null);

    const sendMessage = async ({ query, latitude, longitude }: { query: string, latitude?: number, longitude?: number }) => {
        setIsStreaming(true);
        setActiveTool(null);

        try {
            // 2. Prepare streaming message
            const sourcesThisResponse: PolicySource[] = [];
            const assistantMsg: ChatMessage = { role: 'assistant', content: '', timestamp: new Date().toISOString(), sources: [] };
            setHistory(prev => [...prev, assistantMsg]);

            // 3. Start Stream
            const response = await fetch(`/api${API_ENDPOINTS.SMART_CHAT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    latitude,
                    longitude,
                    context: 'admin',
                    page_path:
                        typeof window !== 'undefined' ? window.location.pathname : '',
                }),
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to start chat stream');
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6).trim();
                        if (dataStr === '[DONE]') break;

                        try {
                            const data = JSON.parse(dataStr);
                            if (data.token) {
                                fullContent += data.token;
                                // Update the last message in history with the accumulated content
                                setHistory(prev => {
                                    const newHistory = [...prev];
                                    const last = newHistory[newHistory.length - 1];
                                    if (last && last.role === 'assistant') {
                                        last.content = fullContent;
                                    }
                                    return newHistory;
                                });
                            } else if (data.tool_start) {
                                setActiveTool({ name: data.tool_start, status: 'running' });
                            } else if (data.tool_end) {
                                setActiveTool({ name: data.tool_end, status: 'completed' });
                            } else if (data.sources && Array.isArray(data.sources)) {
                                for (const src of data.sources as PolicySource[]) {
                                    const key = `${src.file_id}-${src.page_number}-${src.chunk_id}`;
                                    const exists = sourcesThisResponse.some(
                                        s => `${s.file_id}-${s.page_number}-${s.chunk_id}` === key
                                    );
                                    if (!exists) sourcesThisResponse.push(src);
                                }
                                setHistory(prev => {
                                    const newHistory = [...prev];
                                    const last = newHistory[newHistory.length - 1];
                                    if (last && last.role === 'assistant') {
                                        last.sources = [...sourcesThisResponse];
                                    }
                                    return newHistory;
                                });
                            } else if (data.error) {
                                // Handle backend errors gracefully
                                const errorMsg = `[ERROR_CARD] title: Assistant Error | message: ${data.error} [/ERROR_CARD]`;
                                setHistory(prev => {
                                    const newHistory = [...prev];
                                    const last = newHistory[newHistory.length - 1];
                                    if (last && last.role === 'assistant') {
                                        last.content = errorMsg;
                                    }
                                    return newHistory;
                                });
                                break; // Stop streaming on error
                            } else if (data.history) {
                                // Final sync — preserve sources
                                setHistory(() => {
                                    const serverHistory: ChatMessage[] = data.history;
                                    if (sourcesThisResponse.length > 0 && serverHistory.length > 0) {
                                        const lastMsg = serverHistory[serverHistory.length - 1];
                                        if (lastMsg.role === 'assistant') {
                                            lastMsg.sources = sourcesThisResponse;
                                        }
                                    }
                                    return serverHistory;
                                });
                            }
                        } catch (e) {
                            console.warn("Error parsing stream chunk", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Streaming error", error);
        } finally {
            setIsStreaming(false);
            setActiveTool(null);
            queryClient.invalidateQueries({ queryKey: ['assistant-history'] });
        }
    };

    const clearHistory = async () => {
        try {
            await client.delete(`${API_ENDPOINTS.SMART_CHAT}?context=admin`);
            setHistory([]);
            queryClient.invalidateQueries({ queryKey: ['assistant-history'] });
        } catch (error) {
            console.error("Failed to clear assistant history", error);
        }
    };

    return {
        messages: history,
        setMessages: setHistory,
        sendMessage,
        isLoading: isStreaming || isHistoryLoading,
        isHistoryLoading,
        isStreaming,
        activeTool,
        clearHistory,
        config: data?.config
    };
};
