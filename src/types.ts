
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface Aquarium {
  id: string;
  user_id: string;
  name: string;
  volume: number;
  sump_volume?: number;
  type: string;
  setup_date: string;
  fauna: string;
  equipment: string;
  created_at?: string;
}

export interface AquariumEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  type: 'Feira' | 'Encontro' | 'Campeonato' | 'Grupo Whats' | 'Workshop' | 'Loja';
  image?: string;
  link?: string;
  video_url?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  subscription_tier?: 'hobby' | 'pro' | 'master';
  created_at: string;
}
