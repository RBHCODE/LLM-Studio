import { useState, useEffect } from 'react';
import { supabase, Prompt, Project } from '../lib/supabase';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export function Prompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [systemMessage, setSystemMessage] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
    loadPrompts();
  }, []);

  const loadProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('name');

    if (data) {
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id);
      }
    }
  };

  const loadPrompts = async () => {
    const { data } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setPrompts(data);
    }
  };

  const createPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setLoading(true);
    const { error } = await supabase
      .from('prompts')
      .insert([
        {
          project_id: selectedProject,
          name,
          content,
          system_message: systemMessage,
          temperature,
          max_tokens: maxTokens,
        },
      ]);

    if (!error) {
      setName('');
      setContent('');
      setSystemMessage('');
      setTemperature(0.7);
      setMaxTokens(1000);
      setShowForm(false);
      loadPrompts();
    }
    setLoading(false);
  };

  const deletePrompt = async (id: string) => {
    if (!confirm('Delete this prompt?')) return;
    await supabase.from('prompts').delete().eq('id', id);
    loadPrompts();
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Prompts</h2>
            <p className="text-slate-600 mt-1">Design and manage your AI prompts</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={projects.length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            New Prompt
          </button>
        </div>

        {projects.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">Create a project first before adding prompts.</p>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Prompt</h3>
            <form onSubmit={createPrompt} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
                  Prompt Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  System Message
                </label>
                <textarea
                  value={systemMessage}
                  onChange={(e) => setSystemMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional: Define the AI's role and behavior"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Prompt Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  placeholder="Enter your prompt template here..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Temperature ({temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-1">Controls randomness</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="4000"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {prompts.map((prompt) => {
            const project = projects.find((p) => p.id === prompt.project_id);
            return (
              <div
                key={prompt.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{prompt.name}</h3>
                    {project && (
                      <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {project.name}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deletePrompt(prompt.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {prompt.system_message && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-slate-700 mb-1">System Message:</p>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {prompt.system_message}
                    </p>
                  </div>
                )}

                <div className="mb-3">
                  <p className="text-sm font-medium text-slate-700 mb-1">Prompt:</p>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">
                    {prompt.content}
                  </p>
                </div>

                <div className="flex gap-4 text-sm text-slate-500">
                  <span>Temp: {prompt.temperature}</span>
                  <span>Max Tokens: {prompt.max_tokens}</span>
                </div>
              </div>
            );
          })}

          {prompts.length === 0 && !showForm && projects.length > 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No prompts yet. Create your first prompt to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
