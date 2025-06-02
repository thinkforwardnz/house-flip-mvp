export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_alerts: {
        Row: {
          alert_type: string
          date_raised: string | null
          deal_id: string
          description: string | null
          id: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          title: string
        }
        Insert: {
          alert_type: string
          date_raised?: string | null
          deal_id: string
          description?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          title: string
        }
        Update: {
          alert_type?: string
          date_raised?: string | null
          deal_id?: string
          description?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_alerts_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          address: string
          city: string | null
          created_at: string | null
          current_profit: number | null
          current_risk: Database["public"]["Enums"]["risk_level"] | null
          id: string
          notes: string | null
          pipeline_stage: Database["public"]["Enums"]["pipeline_stage"] | null
          purchase_price: number | null
          suburb: string | null
          target_sale_price: number | null
          team_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          city?: string | null
          created_at?: string | null
          current_profit?: number | null
          current_risk?: Database["public"]["Enums"]["risk_level"] | null
          id?: string
          notes?: string | null
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          purchase_price?: number | null
          suburb?: string | null
          target_sale_price?: number | null
          team_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          city?: string | null
          created_at?: string | null
          current_profit?: number | null
          current_risk?: Database["public"]["Enums"]["risk_level"] | null
          id?: string
          notes?: string | null
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          purchase_price?: number | null
          suburb?: string | null
          target_sale_price?: number | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          deal_id: string
          description: string | null
          file_name: string | null
          file_size: number | null
          file_type: Database["public"]["Enums"]["file_type"] | null
          file_url: string
          id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          deal_id: string
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: Database["public"]["Enums"]["file_type"] | null
          file_url: string
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          deal_id?: string
          description?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: Database["public"]["Enums"]["file_type"] | null
          file_url?: string
          id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
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
      offers: {
        Row: {
          agent_name: string | null
          conditions: string | null
          created_at: string | null
          date_made: string | null
          deal_id: string
          deposit: number | null
          id: string
          offer_price: number
          settlement_date: string | null
          status: Database["public"]["Enums"]["offer_status"] | null
          updated_at: string | null
        }
        Insert: {
          agent_name?: string | null
          conditions?: string | null
          created_at?: string | null
          date_made?: string | null
          deal_id: string
          deposit?: number | null
          id?: string
          offer_price: number
          settlement_date?: string | null
          status?: Database["public"]["Enums"]["offer_status"] | null
          updated_at?: string | null
        }
        Update: {
          agent_name?: string | null
          conditions?: string | null
          created_at?: string | null
          date_made?: string | null
          deal_id?: string
          deposit?: number | null
          id?: string
          offer_price?: number
          settlement_date?: string | null
          status?: Database["public"]["Enums"]["offer_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      open_homes: {
        Row: {
          agent_name: string | null
          attendees: number | null
          created_at: string | null
          deal_id: string
          duration_minutes: number | null
          feedback: string | null
          id: string
          notes: string | null
          scheduled_date: string
          updated_at: string | null
        }
        Insert: {
          agent_name?: string | null
          attendees?: number | null
          created_at?: string | null
          deal_id: string
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          notes?: string | null
          scheduled_date: string
          updated_at?: string | null
        }
        Update: {
          agent_name?: string | null
          attendees?: number | null
          created_at?: string | null
          deal_id?: string
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          notes?: string | null
          scheduled_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "open_homes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          deal_id: string
          floor_area: number | null
          id: string
          land_area: number | null
          listing_photos: string[] | null
          listing_url: string | null
          parking_spaces: number | null
          property_type: string | null
          updated_at: string | null
          year_built: number | null
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          deal_id: string
          floor_area?: number | null
          id?: string
          land_area?: number | null
          listing_photos?: string[] | null
          listing_url?: string | null
          parking_spaces?: number | null
          property_type?: string | null
          updated_at?: string | null
          year_built?: number | null
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          deal_id?: string
          floor_area?: number | null
          id?: string
          land_area?: number | null
          listing_photos?: string[] | null
          listing_url?: string | null
          parking_spaces?: number | null
          property_type?: string | null
          updated_at?: string | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      renovations: {
        Row: {
          category: string | null
          contractor_contact: string | null
          contractor_name: string | null
          cost_actual: number | null
          cost_estimate: number | null
          created_at: string | null
          deal_id: string
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: Database["public"]["Enums"]["renovation_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          contractor_contact?: string | null
          contractor_name?: string | null
          cost_actual?: number | null
          cost_estimate?: number | null
          created_at?: string | null
          deal_id: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["renovation_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          contractor_contact?: string | null
          contractor_name?: string | null
          cost_actual?: number | null
          cost_estimate?: number | null
          created_at?: string | null
          deal_id?: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["renovation_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "renovations_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      scraped_listings: {
        Row: {
          address: string
          ai_arv: number | null
          ai_confidence: number | null
          ai_est_profit: number | null
          ai_reno_cost: number | null
          ai_score: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string
          date_scraped: string
          flip_potential: Database["public"]["Enums"]["flip_potential"] | null
          floor_area: number | null
          id: string
          land_area: number | null
          listing_date: string | null
          photos: string[] | null
          price: number
          source_site: string | null
          source_url: string
          status: Database["public"]["Enums"]["scraped_listing_status"]
          suburb: string | null
          summary: string | null
          updated_at: string
        }
        Insert: {
          address: string
          ai_arv?: number | null
          ai_confidence?: number | null
          ai_est_profit?: number | null
          ai_reno_cost?: number | null
          ai_score?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          date_scraped?: string
          flip_potential?: Database["public"]["Enums"]["flip_potential"] | null
          floor_area?: number | null
          id?: string
          land_area?: number | null
          listing_date?: string | null
          photos?: string[] | null
          price: number
          source_site?: string | null
          source_url: string
          status?: Database["public"]["Enums"]["scraped_listing_status"]
          suburb?: string | null
          summary?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          ai_arv?: number | null
          ai_confidence?: number | null
          ai_est_profit?: number | null
          ai_reno_cost?: number | null
          ai_score?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          date_scraped?: string
          flip_potential?: Database["public"]["Enums"]["flip_potential"] | null
          floor_area?: number | null
          id?: string
          land_area?: number | null
          listing_date?: string | null
          photos?: string[] | null
          price?: number
          source_site?: string | null
          source_url?: string
          status?: Database["public"]["Enums"]["scraped_listing_status"]
          suburb?: string | null
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          deal_id: string
          description: string | null
          due_date: string | null
          id: string
          priority: number | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          type: Database["public"]["Enums"]["task_type"] | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          deal_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          type?: Database["public"]["Enums"]["task_type"] | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          deal_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["task_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_scraped_listing_actions: {
        Row: {
          action: Database["public"]["Enums"]["scraped_listing_status"]
          created_at: string
          deal_id: string | null
          id: string
          scraped_listing_id: string
          user_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["scraped_listing_status"]
          created_at?: string
          deal_id?: string | null
          id?: string
          scraped_listing_id: string
          user_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["scraped_listing_status"]
          created_at?: string
          deal_id?: string | null
          id?: string
          scraped_listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_scraped_listing_actions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_scraped_listing_actions_scraped_listing_id_fkey"
            columns: ["scraped_listing_id"]
            isOneToOne: false
            referencedRelation: "scraped_listings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_deal: {
        Args: { deal_uuid: string }
        Returns: boolean
      }
      get_current_user_team_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_listing_status: {
        Args: { listing_id: string; user_uuid: string }
        Returns: Database["public"]["Enums"]["scraped_listing_status"]
      }
    }
    Enums: {
      file_type: "photo" | "PDF" | "report" | "contract" | "invoice" | "other"
      flip_potential: "High" | "Medium" | "Low"
      offer_status: "pending" | "accepted" | "rejected" | "counter"
      pipeline_stage:
        | "Analysis"
        | "Offer"
        | "Under Contract"
        | "Reno"
        | "Listed"
        | "Sold"
      renovation_status: "planned" | "in_progress" | "completed" | "cancelled"
      risk_level: "low" | "medium" | "high"
      scraped_listing_status: "new" | "saved" | "dismissed" | "imported"
      task_status: "pending" | "in_progress" | "done"
      task_type:
        | "DD"
        | "Reno"
        | "Marketing"
        | "Legal"
        | "Finance"
        | "Inspection"
        | "Other"
      user_role: "admin" | "investor" | "team_member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      file_type: ["photo", "PDF", "report", "contract", "invoice", "other"],
      flip_potential: ["High", "Medium", "Low"],
      offer_status: ["pending", "accepted", "rejected", "counter"],
      pipeline_stage: [
        "Analysis",
        "Offer",
        "Under Contract",
        "Reno",
        "Listed",
        "Sold",
      ],
      renovation_status: ["planned", "in_progress", "completed", "cancelled"],
      risk_level: ["low", "medium", "high"],
      scraped_listing_status: ["new", "saved", "dismissed", "imported"],
      task_status: ["pending", "in_progress", "done"],
      task_type: [
        "DD",
        "Reno",
        "Marketing",
        "Legal",
        "Finance",
        "Inspection",
        "Other",
      ],
      user_role: ["admin", "investor", "team_member"],
    },
  },
} as const
