/**
 * TypeScript types for the `u_*` tables (Nondit) in the shared Supabase
 * project. Filtered to this app's prefix only - other tables in the project
 * belong to other apps and must never be referenced here.
 *
 * Source of truth: specs/04-data-model/01-data-model.md +
 * supabase/migrations/0001_u_initial_schema.sql
 */

export type ChipSentimentRow = "positive" | "negative" | "neutral";

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
      u_events: {
        Row: {
          id: string;
          name: string;
          event_date: string | null;
          location: string | null;
          public_code: string;
          organizer_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          event_date?: string | null;
          location?: string | null;
          public_code: string;
          organizer_code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          event_date?: string | null;
          location?: string | null;
          public_code?: string;
          organizer_code?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      u_pitches: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          description: string | null;
          slides_url: string | null;
          founder_email: string | null;
          private_code: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          description?: string | null;
          slides_url?: string | null;
          founder_email?: string | null;
          private_code: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          description?: string | null;
          slides_url?: string | null;
          founder_email?: string | null;
          private_code?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "u_pitches_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "u_events";
            referencedColumns: ["id"];
          },
        ];
      };
      u_jurors: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "u_jurors_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "u_events";
            referencedColumns: ["id"];
          },
        ];
      };
      u_chips: {
        Row: {
          id: string;
          event_id: string;
          label: string;
          sentiment: ChipSentimentRow;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          label: string;
          sentiment: ChipSentimentRow;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          label?: string;
          sentiment?: ChipSentimentRow;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "u_chips_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "u_events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "u_chips_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "u_jurors";
            referencedColumns: ["id"];
          },
        ];
      };
      u_feedback: {
        Row: {
          id: string;
          pitch_id: string;
          juror_id: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pitch_id: string;
          juror_id: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pitch_id?: string;
          juror_id?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "u_feedback_pitch_id_fkey";
            columns: ["pitch_id"];
            isOneToOne: false;
            referencedRelation: "u_pitches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "u_feedback_juror_id_fkey";
            columns: ["juror_id"];
            isOneToOne: false;
            referencedRelation: "u_jurors";
            referencedColumns: ["id"];
          },
        ];
      };
      u_criteria: {
        Row: {
          id: string;
          event_id: string;
          label: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          label: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          label?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "u_criteria_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "u_events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "u_criteria_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "u_jurors";
            referencedColumns: ["id"];
          },
        ];
      };
      u_feedback_ratings: {
        Row: {
          feedback_id: string;
          criterion_id: string;
          score: number;
        };
        Insert: {
          feedback_id: string;
          criterion_id: string;
          score: number;
        };
        Update: {
          feedback_id?: string;
          criterion_id?: string;
          score?: number;
        };
        Relationships: [
          {
            foreignKeyName: "u_feedback_ratings_feedback_id_fkey";
            columns: ["feedback_id"];
            isOneToOne: false;
            referencedRelation: "u_feedback";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "u_feedback_ratings_criterion_id_fkey";
            columns: ["criterion_id"];
            isOneToOne: false;
            referencedRelation: "u_criteria";
            referencedColumns: ["id"];
          },
        ];
      };
      u_feedback_chips: {
        Row: {
          feedback_id: string;
          chip_id: string;
        };
        Insert: {
          feedback_id: string;
          chip_id: string;
        };
        Update: {
          feedback_id?: string;
          chip_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "u_feedback_chips_feedback_id_fkey";
            columns: ["feedback_id"];
            isOneToOne: false;
            referencedRelation: "u_feedback";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "u_feedback_chips_chip_id_fkey";
            columns: ["chip_id"];
            isOneToOne: false;
            referencedRelation: "u_chips";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
