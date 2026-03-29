export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          contractor_id: string | null
          created_at: string | null
          id: string
          project_id: string | null
          proposal: string
          status: string | null
          timeline_days: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          contractor_id?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          proposal: string
          status?: string | null
          timeline_days: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          contractor_id?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          proposal?: string
          status?: string | null
          timeline_days?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bids_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          actual_amount: number | null
          allocated_amount: number
          category: string
          created_at: string | null
          description: string | null
          id: string
          project_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_amount?: number | null
          allocated_amount: number
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          project_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_amount?: number | null
          allocated_amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      buyers: {
        Row: {
          company_name: string | null
          created_at: string | null
          id: string
          position: string | null
          total_projects_initiated: number | null
          updated_at: string | null
          user_id: string
          verified_phone: boolean | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          id?: string
          position?: string | null
          total_projects_initiated?: number | null
          updated_at?: string | null
          user_id: string
          verified_phone?: boolean | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          id?: string
          position?: string | null
          total_projects_initiated?: number | null
          updated_at?: string | null
          user_id?: string
          verified_phone?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "buyers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          average_rating: number | null
          bir_registration: string | null
          business_permit: string | null
          certifications: string[] | null
          company_name: string
          created_at: string | null
          id: string
          pcab_license: string | null
          team_size: number | null
          tier: string | null
          total_projects_completed: number | null
          updated_at: string | null
          user_id: string
          verification_score: number | null
          verification_status: string | null
          years_in_business: number | null
        }
        Insert: {
          average_rating?: number | null
          bir_registration?: string | null
          business_permit?: string | null
          certifications?: string[] | null
          company_name: string
          created_at?: string | null
          id?: string
          pcab_license?: string | null
          team_size?: number | null
          tier?: string | null
          total_projects_completed?: number | null
          updated_at?: string | null
          user_id: string
          verification_score?: number | null
          verification_status?: string | null
          years_in_business?: number | null
        }
        Update: {
          average_rating?: number | null
          bir_registration?: string | null
          business_permit?: string | null
          certifications?: string[] | null
          company_name?: string
          created_at?: string | null
          id?: string
          pcab_license?: string | null
          team_size?: number | null
          tier?: string | null
          total_projects_completed?: number | null
          updated_at?: string | null
          user_id?: string
          verification_score?: number | null
          verification_status?: string | null
          years_in_business?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contractors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          contractor_id: string | null
          created_at: string | null
          file_type: string | null
          file_url: string
          id: string
          project_id: string | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          contractor_id?: string | null
          created_at?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          project_id?: string | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          contractor_id?: string | null
          created_at?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          project_id?: string | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          created_at: string | null
          findings: string | null
          id: string
          inspection_date: string
          inspector_id: string | null
          passed: boolean | null
          photos: string[] | null
          project_id: string
          recommendations: string | null
          report_url: string | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          findings?: string | null
          id?: string
          inspection_date: string
          inspector_id?: string | null
          passed?: boolean | null
          photos?: string[] | null
          project_id: string
          recommendations?: string | null
          report_url?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          findings?: string | null
          id?: string
          inspection_date?: string
          inspector_id?: string | null
          passed?: boolean | null
          photos?: string[] | null
          project_id?: string
          recommendations?: string | null
          report_url?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      project_requirements: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          requirement: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          requirement: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          requirement?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_requirements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_scope: {
        Row: {
          created_at: string | null
          description: string
          id: string
          project_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          project_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_scope_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          accomplishments: string | null
          completion_percentage: number
          id: string
          issues_encountered: string | null
          photos: string[] | null
          plans_for_next_week: string | null
          project_id: string
          submitted_at: string | null
          submitted_by: string | null
          week_number: number
        }
        Insert: {
          accomplishments?: string | null
          completion_percentage: number
          id?: string
          issues_encountered?: string | null
          photos?: string[] | null
          plans_for_next_week?: string | null
          project_id: string
          submitted_at?: string | null
          submitted_by?: string | null
          week_number: number
        }
        Update: {
          accomplishments?: string | null
          completion_percentage?: number
          id?: string
          issues_encountered?: string | null
          photos?: string[] | null
          plans_for_next_week?: string | null
          project_id?: string
          submitted_at?: string | null
          submitted_by?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          awarded_at: string | null
          budget: number | null
          buyer_id: string
          completion_percentage: number | null
          contractor_id: string | null
          created_at: string | null
          current_cost: number | null
          description: string | null
          end_date: string | null
          id: string
          published_at: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          awarded_at?: string | null
          budget?: number | null
          buyer_id: string
          completion_percentage?: number | null
          contractor_id?: string | null
          created_at?: string | null
          current_cost?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          published_at?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          awarded_at?: string | null
          budget?: number | null
          buyer_id?: string
          completion_percentage?: number | null
          contractor_id?: string | null
          created_at?: string | null
          current_cost?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          published_at?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          categories: Json | null
          comment: string | null
          created_at: string | null
          id: string
          project_id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          updated_at: string | null
        }
        Insert: {
          categories?: Json | null
          comment?: string | null
          created_at?: string | null
          id?: string
          project_id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          updated_at?: string | null
        }
        Update: {
          categories?: Json | null
          comment?: string | null
          created_at?: string | null
          id?: string
          project_id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
