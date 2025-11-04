import { useState, useEffect, useRef } from 'react';
import { supabase, Project, Prompt, LLMProvider, Message } from '../lib/supabase';
import { Send, Loader2 } from 'lucide-react';

export function Playground() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadPrompts(selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async () => {
    const [projectsRes, providersRes] = await Promise.all([
      supabase.from('projects').select('*').order('name'),
      supabase.from('llm_providers').select('*').eq('is_active', true),
    ]);

    if (projectsRes.data) {
      setProjects(projectsRes.data);
      if (projectsRes.data.length > 0) {
        setSelectedProject(projectsRes.data[0].id);
      }
    }

    if (providersRes.data) {
      setProviders(providersRes.data);
      if (providersRes.data.length > 0) {
        setSelectedProvider(providersRes.data[0].id);
      }
    }
  };

  const loadPrompts = async (projectId: string) => {
    const { data } = await supabase
      .from('prompts')
      .select('*')
      .eq('project_id', projectId)
      .order('name');

    if (data) {
      setPrompts(data);
      if (data.length > 0) {
        setSelectedPrompt(data[0].id);
      }
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedProject || !selectedProvider) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: 'temp',
      role: 'user',
      content: inputMessage,
      tokens_used: 0,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const aiMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: 'temp',
      role: 'assistant',
      content:
        "This is a demo response. To integrate with real LLM providers, you'll need to set up edge functions that securely call the provider APIs using the stored API keys.",
      tokens_used: 50,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setLoading(false);
  };

  const selectedPromptData = prompts.find((p) => p.id === selectedPrompt);
  const selectedProviderData = providers.find((p) => p.id === selectedProvider);

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Playground</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Prompt Template
              </label>
              <select
                value={selectedPrompt}
                onChange={(e) => setSelectedPrompt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={prompts.length === 0}
              >
                <option value="">Select a prompt</option>
                {prompts.map((prompt) => (
                  <option key={prompt.id} value={prompt.id}>
                    {prompt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={providers.length === 0}
              >
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.provider_name} - {provider.model_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedPromptData && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-900 mb-1">Active Prompt:</p>
              <p className="text-sm text-blue-800">{selectedPromptData.content}</p>
              {selectedPromptData.system_message && (
                <p className="text-xs text-blue-700 mt-2">
                  System: {selectedPromptData.system_message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">
                Start a conversation by typing a message below
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-xl p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-900 border border-slate-200'
                }`}
              >
                <p className="text-sm font-medium mb-1">
                  {message.role === 'user' ? 'You' : selectedProviderData?.provider_name || 'AI'}
                </p>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-slate-200 p-4">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading || projects.length === 0 || providers.length === 0}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim() || projects.length === 0 || providers.length === 0}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
          {(projects.length === 0 || providers.length === 0) && (
            <p className="text-sm text-amber-600 mt-2">
              Configure at least one project and one provider to start chatting
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
