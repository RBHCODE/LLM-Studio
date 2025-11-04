import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type Prompt = {
  id: string;
  project_id: string;
  name: string;
  content: string;
  system_message: string;
  temperature: number;
  max_tokens: number;
  created_at: string;
  updated_at: string;
};

export type LLMProvider = {
  id: string;
  user_id: string;
  provider_name: string;
  api_key_encrypted: string;
  model_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  project_id: string;
  prompt_id: string | null;
  provider_id: string | null;
  title: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used: number;
  created_at: string;
};
