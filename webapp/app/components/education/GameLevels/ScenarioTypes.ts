// Tipi di scenario supportati
export type ScenarioType = 
  | 'multiple_choice'
  | 'drag_drop' 
  | 'matching'
  | 'simulation'
  | 'ordering'
  | 'fill_blank';

export interface GameScenario {
  id: string;
  module_id: string;
  level_number: number; // 1-5
  scenario_number: number; // 1-4
  title: Record<string, string>; // i18n: {it: "...", en: "...", ...}
  description: Record<string, string>;
  scenario_type: ScenarioType;
  content: {
    // Per multiple_choice
    question?: Record<string, string>;
    options?: Array<{ id: string; text: Record<string, string> }>;
    correct_answer?: string;
    
    // Per drag_drop  
    drag_items?: Array<{
      id: string;
      label: Record<string, string>;
      image_url?: string;
    }>;
    drop_zones?: Array<{
      id: string;
      label: Record<string, string>;
      correct_item_id?: string;
    }>;
    
    // Per matching
    pairs?: Array<{
      left: { id: string; text: Record<string, string> };
      right: { id: string; text: Record<string, string> };
      correct_match: boolean;
    }>;
    
    // Per fill_blank
    text_with_gaps?: Array<{
      text: Record<string, string>;
      is_gap: boolean;
      correct_answer?: string;
    }>;
    
    // Per ordering
    items_to_order?: Array<{
      id: string;
      text: Record<string, string>;
      correct_position: number;
    }>;
  };
  feedback: {
    correct: Record<string, string>;
    incorrect: Record<string, string>;
    explanation: Record<string, string>;
  };
  points: number;
  time_limit?: number; // secondi
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserScenarioAnswer {
  scenarioId: string;
  userAnswers: Record<string, any>;
  score: number;
  timeSpent: number; // secondi
  completed: boolean;
  completedAt: Date;
}

export interface LevelProgress {
  levelNumber: number;
  scenariosCompleted: number;
  totalScenarios: number;
  score: number;
  unlocked: boolean;
  completed: boolean;
}
