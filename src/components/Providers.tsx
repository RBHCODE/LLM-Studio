import { useState, useEffect } from 'react';
import { supabase, LLMProvider } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';

export function Providers() {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [providerName, setProviderName] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gpt-4');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    const { data } = await supabase
      .from('llm_providers')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setProviders(data);
    }
  };

  const createProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('llm_providers')
      .insert([
        {
          user_id: user.id,
          provider_name: providerName,
          api_key_encrypted: apiKey,
          model_name: modelName,
          is_active: true,
        },
      ]);

    if (!error) {
      setProviderName('openai');
      setApiKey('');
      setModelName('gpt-4');
      setShowForm(false);
      loadProviders();
    }
    setLoading(false);
  };

  const deleteProvider = async (id: string) => {
    if (!confirm('Delete this provider configuration?')) return;
    await supabase.from('llm_providers').delete().eq('id', id);
    loadProviders();
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('llm_providers')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    loadProviders();
  };

  const providerOptions = [
    { value: 'openai', label: 'OpenAI', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { value: 'anthropic', label: 'Anthropic', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
    { value: 'cohere', label: 'Cohere', models: ['command', 'command-light'] },
    { value: 'google', label: 'Google AI', models: ['gemini-pro', 'gemini-pro-vision'] },
  ];

  const selectedProvider = providerOptions.find((p) => p.value === providerName);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">LLM Providers</h2>
            <p className="text-slate-600 mt-1">Configure your AI model providers</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Provider
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Provider</h3>
            <form onSubmit={createProvider} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Provider
                </label>
                <select
                  value={providerName}
                  onChange={(e) => {
                    setProviderName(e.target.value);
                    const provider = providerOptions.find((p) => p.value === e.target.value);
                    if (provider) setModelName(provider.models[0]);
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {providerOptions.map((provider) => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Model
                </label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {selectedProvider?.models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Your API key is stored securely in the database
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Add Provider
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
          {providers.map((provider) => {
            const providerInfo = providerOptions.find((p) => p.value === provider.provider_name);
            return (
              <div
                key={provider.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {providerInfo?.label || provider.provider_name}
                      </h3>
                      <button
                        onClick={() => toggleActive(provider.id, provider.is_active)}
                        className="flex items-center gap-1 text-sm"
                      >
                        {provider.is_active ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-400">Inactive</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-slate-600">Model: {provider.model_name}</p>
                    <p className="text-sm text-slate-400 mt-2">
                      API Key: {provider.api_key_encrypted.substring(0, 8)}...
                    </p>
                    <p className="text-sm text-slate-400">
                      Added {new Date(provider.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteProvider(provider.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}

          {providers.length === 0 && !showForm && (
            <div className="text-center py-12">
              <p className="text-slate-500">No providers configured. Add a provider to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
