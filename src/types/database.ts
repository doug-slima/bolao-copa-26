export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      predictions: {
        Row: {
          id: string;
          match_id: string;
          user_id: string;
          user_name: string;
          user_avatar_url: string | null;
          home_score: number;
          away_score: number;
          first_to_score: "home" | "away" | "none";
          points_exact_score: number | null;
          points_result: number | null;
          points_first_scorer: number | null;
          points_total: number | null;
          is_unique_exact: boolean | null;
          is_unique_result: boolean | null;
          is_unique_first_scorer: boolean | null;
          created_at: string;
          updated_at: string | null;
          locked_at: string | null;
        };
        Insert: {
          id?: string;
          match_id: string;
          user_id: string;
          user_name: string;
          user_avatar_url?: string | null;
          home_score: number;
          away_score: number;
          first_to_score: "home" | "away" | "none";
          points_exact_score?: number | null;
          points_result?: number | null;
          points_first_scorer?: number | null;
          points_total?: number | null;
          is_unique_exact?: boolean | null;
          is_unique_result?: boolean | null;
          is_unique_first_scorer?: boolean | null;
          created_at?: string;
          updated_at?: string | null;
          locked_at?: string | null;
        };
        Update: {
          id?: string;
          match_id?: string;
          user_id?: string;
          user_name?: string;
          user_avatar_url?: string | null;
          home_score?: number;
          away_score?: number;
          first_to_score?: "home" | "away" | "none";
          points_exact_score?: number | null;
          points_result?: number | null;
          points_first_scorer?: number | null;
          points_total?: number | null;
          is_unique_exact?: boolean | null;
          is_unique_result?: boolean | null;
          is_unique_first_scorer?: boolean | null;
          created_at?: string;
          updated_at?: string | null;
          locked_at?: string | null;
        };
      };
      challenges: {
        Row: {
          id: string;
          match_id: string;
          challenger_id: string;
          challenger_name: string;
          challenged_id: string;
          challenged_name: string;
          status: "pending" | "accepted" | "declined" | "completed";
          challenger_points: number | null;
          challenged_points: number | null;
          winner: "challenger" | "challenged" | "tie" | "void" | null;
          created_at: string;
          accepted_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          match_id: string;
          challenger_id: string;
          challenger_name: string;
          challenged_id: string;
          challenged_name: string;
          status?: "pending" | "accepted" | "declined" | "completed";
          challenger_points?: number | null;
          challenged_points?: number | null;
          winner?: "challenger" | "challenged" | "tie" | "void" | null;
          created_at?: string;
          accepted_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          match_id?: string;
          challenger_id?: string;
          challenger_name?: string;
          challenged_id?: string;
          challenged_name?: string;
          status?: "pending" | "accepted" | "declined" | "completed";
          challenger_points?: number | null;
          challenged_points?: number | null;
          winner?: "challenger" | "challenged" | "tie" | "void" | null;
          created_at?: string;
          accepted_at?: string | null;
          completed_at?: string | null;
        };
      };
      leagues: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          invite_code: string;
          created_by: string;
          created_by_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          invite_code: string;
          created_by: string;
          created_by_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          invite_code?: string;
          created_by?: string;
          created_by_name?: string;
          created_at?: string;
        };
      };
      league_members: {
        Row: {
          id: string;
          league_id: string;
          user_id: string;
          user_name: string;
          user_avatar_url: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          league_id: string;
          user_id: string;
          user_name: string;
          user_avatar_url?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          league_id?: string;
          user_id?: string;
          user_name?: string;
          user_avatar_url?: string | null;
          joined_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          clerk_id: string;
          name: string;
          avatar_url: string | null;
          total_points: number;
          exact_predictions: number;
          correct_results: number;
          correct_first_scorers: number;
          total_predictions: number;
          challenge_wins: number;
          challenge_losses: number;
          current_streak: number;
          best_streak: number;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          name: string;
          avatar_url?: string | null;
          total_points?: number;
          exact_predictions?: number;
          correct_results?: number;
          correct_first_scorers?: number;
          total_predictions?: number;
          challenge_wins?: number;
          challenge_losses?: number;
          current_streak?: number;
          best_streak?: number;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          name?: string;
          avatar_url?: string | null;
          total_points?: number;
          exact_predictions?: number;
          correct_results?: number;
          correct_first_scorers?: number;
          total_predictions?: number;
          challenge_wins?: number;
          challenge_losses?: number;
          current_streak?: number;
          best_streak?: number;
          created_at?: string;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
