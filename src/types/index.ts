
export type SubscriptionTier = 'hobby' | 'pro' | 'master' | 'lojista';
export type TankType = 'Doce' | 'Marinho' | 'Reef' | 'Jumbo' | 'Plantado';
export type EventType = 'Feira' | 'Encontro' | 'Campeonato' | 'Workshop' | 'Loja' | 'Grupo WhatsApp' | 'Live/Transmissão' | 'Promoção';
export type MaintenanceTaskType = 'TPA' | 'Limpeza Filtro' | 'Dosagem' | 'Alimentação' | 'Teste Água' | 'Poda Plantas' | 'Limpeza Vidro' | 'Troca Carvão' | 'Outro';
export type TaskFrequency = 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'trimestral' | 'unica';

// --- Interface de Planos ---
export interface PlanInfo {
  id: SubscriptionTier;
  name: string;
  price: number;
  priceYearly: number;
  description: string;
  maxAquariums: number;
  maxClients: number;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export const PLANS: PlanInfo[] = [
  {
    id: 'hobby',
    name: 'Hobby',
    price: 0,
    priceYearly: 0,
    description: 'Perfeito para quem está começando',
    maxAquariums: 1,
    maxClients: 0,
    features: [
      '1 aquário',
      'Dashboard básico',
      'Mural de eventos',
      'Calculadoras básicas',
      'Suporte por email'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 24.90,
    priceYearly: 179.00,
    description: 'Para aquaristas dedicados',
    maxAquariums: 5,
    maxClients: 0,
    highlighted: true,
    badge: 'Mais Popular',
    features: [
      'Até 5 aquários',
      'Todas as ferramentas',
      'Histórico completo de testes',
      'Gráficos de evolução',
      'Modo Viagem ilimitado',
      'Lembretes inteligentes',
      'Suporte prioritário'
    ]
  },
  {
    id: 'master',
    name: 'Master',
    price: 49.90,
    priceYearly: 349.00,
    description: 'Para entusiastas avançados',
    maxAquariums: 999,
    maxClients: 0,
    features: [
      'Aquários ilimitados',
      'Tudo do Pro +',
      'IA para diagnóstico',
      'Integração IoT',
      'Alertas por WhatsApp',
      'Backup na nuvem',
      'Acesso antecipado a novidades',
      'Suporte VIP'
    ]
  },
  {
    id: 'lojista',
    name: 'Lojista',
    price: 99.90,
    priceYearly: 749.00,
    description: 'Para lojas e profissionais',
    maxAquariums: 999,
    maxClients: 999,
    badge: 'B2B',
    features: [
      'Tudo do Master +',
      'Gestão de clientes ilimitada',
      'Agenda de manutenções',
      'Relatórios PDF personalizados',
      'Logo da empresa nos relatórios',
      'Múltiplos usuários (em breve)',
      'API de integração (em breve)',
      'Selo de Loja Verificada'
    ]
  }
];

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, { 
  maxAquariums: number; 
  features: string[];
  travelMode: boolean;
  shopCRM: boolean;
}> = {
  hobby: {
    maxAquariums: 1,
    features: ['Dashboard Básico', '1 Aquário', 'Histórico 30 dias'],
    travelMode: false,
    shopCRM: false
  },
  pro: {
    maxAquariums: 5,
    features: ['5 Aquários', 'Modo Viagem', 'Histórico Vitalício', 'Ferramentas Pro'],
    travelMode: true,
    shopCRM: false
  },
  master: {
    maxAquariums: 999,
    features: ['Aquários Ilimitados', 'IA Avançada', 'Prioridade Suporte', 'Badge Mestre'],
    travelMode: true,
    shopCRM: false
  },
  lojista: {
    maxAquariums: 999,
    features: ['Gestão de Clientes', 'Dashboard Lojista', 'Aquários Ilimitados', 'Modo Viagem'],
    travelMode: true,
    shopCRM: true
  }
};

// --- Tipos Gerais ---

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  subscription_tier?: SubscriptionTier;
  company_name?: string;
  created_at: string;
  avatar_url?: string;
}

export interface Aquarium {
  id: string;
  user_id: string;
  name: string;
  volume_liters: number;
  sump_volume_liters?: number;
  tank_type: TankType;
  setup_date?: string;
  fauna?: string;
  equipment?: string;
  photo_url?: string;
  notes?: string;
  created_at?: string;
}

export interface AquariumEvent {
  id: string; 
  title: string; 
  date: string; 
  location: string; 
  description?: string;
  type: EventType; 
  image?: string; 
  link?: string; 
  video_url?: string;
  whatsapp_link?: string;
}

// --- Tipos Lojista ---

export interface StoreClient {
  id: string;
  store_user_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  aquarium_type?: string;
  created_at: string;
  updated_at?: string;
  // Campos calculados (joins)
  aquariums_count?: number;
}

export interface ClientAquarium {
  id: string;
  client_id: string;
  store_user_id: string;
  name: string;
  volume_liters?: number;
  tank_type?: TankType | string;
  location?: string;
  notes?: string;
  photo_url?: string;
  created_at: string;
}

export interface MaintenanceVisit {
  id: string;
  store_user_id: string;
  client_id: string;
  aquarium_id?: string;
  scheduled_date: string;
  scheduled_time?: string;
  duration_minutes: number;
  type: string;
  status: 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada';
  notes?: string;
  services_performed?: string;
  cost?: number;
  is_paid: boolean;
  completed_at?: string;
  created_at: string;
  // Joins
  client?: StoreClient;
  aquarium?: ClientAquarium;
}

export const MAINTENANCE_TYPES = [
  'Manutenção Geral',
  'TPA (Troca Parcial)',
  'Limpeza de Filtro',
  'Teste de Parâmetros',
  'Tratamento de Doenças',
  'Instalação de Equipamento',
  'Consultoria',
  'Montagem de Aquário',
  'Desmontagem',
  'Emergência'
];

export const VISIT_STATUS = {
  agendada: { label: 'Agendada', color: 'bg-blue-500/20 text-blue-300' },
  confirmada: { label: 'Confirmada', color: 'bg-emerald-500/20 text-emerald-300' },
  em_andamento: { label: 'Em Andamento', color: 'bg-amber-500/20 text-amber-300' },
  concluida: { label: 'Concluída', color: 'bg-green-500/20 text-green-300' },
  cancelada: { label: 'Cancelada', color: 'bg-rose-500/20 text-rose-300' }
};

// --- Tipos Técnicos ---

export interface WaterTest {
  id: string;
  aquarium_id: string;
  user_id: string;
  measured_at: string;
  temperature?: number;
  ph?: number;
  ammonia?: number;
  nitrite?: number;
  nitrate?: number;
  salinity?: number;
  alkalinity?: number;
  calcium?: number;
  magnesium?: number;
  phosphate?: number;
  gh?: number;
  kh?: number;
  co2?: number;
  notes?: string;
}

export interface MaintenanceTask {
  id: string;
  aquarium_id: string;
  user_id: string;
  title: string;
  type: MaintenanceTaskType;
  description?: string;
  frequency: TaskFrequency;
  scheduled_date: string;
  completed_at?: string;
  is_completed: boolean;
}

export interface TravelGuide {
  id: string;
  user_id: string;
  aquarium_id?: string;
  title: string;
  start_date: string;
  end_date: string;
  feeding_instructions: string;
  dosing_instructions?: string;
  emergency_instructions?: string;
  general_notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at?: string;
}

export interface ParameterRange {
  min: number;
  max: number;
  ideal_min: number;
  ideal_max: number;
  unit: string;
  critical_high?: number;
  critical_low?: number;
}

export const PARAMETER_RANGES: Record<TankType, Record<string, ParameterRange>> = {
  'Doce': {
    temperature: { min: 22, max: 30, ideal_min: 24, ideal_max: 28, unit: '°C' },
    ph: { min: 6.0, max: 8.0, ideal_min: 6.5, ideal_max: 7.5, unit: '' },
    ammonia: { min: 0, max: 0.5, ideal_min: 0, ideal_max: 0.02, unit: 'ppm', critical_high: 0.1 },
    nitrite: { min: 0, max: 1, ideal_min: 0, ideal_max: 0.02, unit: 'ppm', critical_high: 0.5 },
    nitrate: { min: 0, max: 80, ideal_min: 0, ideal_max: 40, unit: 'ppm' },
  },
  'Plantado': {
    temperature: { min: 22, max: 28, ideal_min: 24, ideal_max: 26, unit: '°C' },
    ph: { min: 6.0, max: 7.5, ideal_min: 6.2, ideal_max: 7.0, unit: '' },
    ammonia: { min: 0, max: 0.5, ideal_min: 0, ideal_max: 0.02, unit: 'ppm' },
    nitrite: { min: 0, max: 1, ideal_min: 0, ideal_max: 0.02, unit: 'ppm' },
    nitrate: { min: 5, max: 50, ideal_min: 10, ideal_max: 30, unit: 'ppm' },
    co2: { min: 10, max: 40, ideal_min: 20, ideal_max: 30, unit: 'ppm' },
  },
  'Marinho': {
    temperature: { min: 23, max: 28, ideal_min: 25, ideal_max: 27, unit: '°C' },
    ph: { min: 7.8, max: 8.5, ideal_min: 8.1, ideal_max: 8.4, unit: '' },
    ammonia: { min: 0, max: 0.1, ideal_min: 0, ideal_max: 0.01, unit: 'ppm' },
    nitrite: { min: 0, max: 0.2, ideal_min: 0, ideal_max: 0.01, unit: 'ppm' },
    nitrate: { min: 0, max: 20, ideal_min: 0, ideal_max: 10, unit: 'ppm' },
    salinity: { min: 1.020, max: 1.028, ideal_min: 1.024, ideal_max: 1.026, unit: 'sg' },
  },
  'Reef': {
    temperature: { min: 24, max: 27, ideal_min: 25, ideal_max: 26.5, unit: '°C' },
    ph: { min: 7.9, max: 8.5, ideal_min: 8.1, ideal_max: 8.4, unit: '' },
    ammonia: { min: 0, max: 0.05, ideal_min: 0, ideal_max: 0, unit: 'ppm' },
    nitrite: { min: 0, max: 0.1, ideal_min: 0, ideal_max: 0, unit: 'ppm' },
    nitrate: { min: 0, max: 10, ideal_min: 0, ideal_max: 5, unit: 'ppm' },
    salinity: { min: 1.023, max: 1.027, ideal_min: 1.025, ideal_max: 1.026, unit: 'sg' },
    alkalinity: { min: 7, max: 12, ideal_min: 8, ideal_max: 9.5, unit: 'dKH' },
    calcium: { min: 350, max: 500, ideal_min: 420, ideal_max: 450, unit: 'ppm' },
    magnesium: { min: 1200, max: 1500, ideal_min: 1300, ideal_max: 1400, unit: 'ppm' },
    phosphate: { min: 0, max: 0.1, ideal_min: 0.01, ideal_max: 0.05, unit: 'ppm' },
  },
  'Jumbo': {
    temperature: { min: 24, max: 30, ideal_min: 26, ideal_max: 28, unit: '°C' },
    ph: { min: 6.5, max: 8.0, ideal_min: 7.0, ideal_max: 7.5, unit: '' },
    ammonia: { min: 0, max: 0.5, ideal_min: 0, ideal_max: 0.05, unit: 'ppm' },
    nitrite: { min: 0, max: 1, ideal_min: 0, ideal_max: 0.1, unit: 'ppm' },
    nitrate: { min: 0, max: 100, ideal_min: 0, ideal_max: 50, unit: 'ppm' },
  },
};

export interface Badge {
  id: string; name: string; description: string; icon: string;
  category: 'maintenance' | 'testing' | 'community' | 'achievement' | 'special' | 'streak';
  points: number; criteria: { type: string; target: number; metric: string };
}

export const AVAILABLE_BADGES: Badge[] = [
  { id: 'first_tank', name: 'Primeiro Passo', description: 'Cadastrou seu primeiro aquário', icon: '🐠', category: 'achievement', points: 10, criteria: { type: 'count', target: 1, metric: 'aquariums' } },
  { id: 'week_streak', name: 'Dedicação Semanal', description: 'Manteve 7 dias seguidos de registros', icon: '🔥', category: 'streak', points: 50, criteria: { type: 'streak', target: 7, metric: 'daily_logs' } },
  { id: 'first_test', name: 'Cientista Iniciante', description: 'Registrou seu primeiro teste de água', icon: '🧪', category: 'testing', points: 15, criteria: { type: 'count', target: 1, metric: 'water_tests' } },
  { id: 'maintenance_pro', name: 'Manutenção em Dia', description: 'Completou 20 tarefas', icon: '🔧', category: 'maintenance', points: 75, criteria: { type: 'count', target: 20, metric: 'completed_tasks' } },
];
