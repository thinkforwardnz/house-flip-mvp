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
          analysis_data: Json | null
          created_at: string | null
          current_profit: number | null
          current_risk: Database["public"]["Enums"]["risk_level"] | null
          estimated_renovation_cost: number | null
          id: string
          listing_details: Json | null
          market_analysis: Json | null
          notes: string | null
          pipeline_stage: Database["public"]["Enums"]["pipeline_stage"] | null
          property_id: string
          purchase_price: number | null
          renovation_analysis: Json | null
          renovation_selections: Json | null
          risk_assessment: Json | null
          target_sale_price: number | null
          team_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          created_at?: string | null
          current_profit?: number | null
          current_risk?: Database["public"]["Enums"]["risk_level"] | null
          estimated_renovation_cost?: number | null
          id?: string
          listing_details?: Json | null
          market_analysis?: Json | null
          notes?: string | null
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          property_id: string
          purchase_price?: number | null
          renovation_analysis?: Json | null
          renovation_selections?: Json | null
          risk_assessment?: Json | null
          target_sale_price?: number | null
          team_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          created_at?: string | null
          current_profit?: number | null
          current_risk?: Database["public"]["Enums"]["risk_level"] | null
          estimated_renovation_cost?: number | null
          id?: string
          listing_details?: Json | null
          market_analysis?: Json | null
          notes?: string | null
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          property_id?: string
          purchase_price?: number | null
          renovation_analysis?: Json | null
          renovation_selections?: Json | null
          risk_assessment?: Json | null
          target_sale_price?: number | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "unified_properties"
            referencedColumns: ["id"]
          },
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
      scraper_config: {
        Row: {
          config_key: string
          config_value: string
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      scraping_history: {
        Row: {
          completed_at: string | null
          created_at: string
          errors: string[] | null
          filters: Json | null
          id: string
          results: Json | null
          sources_requested: string[]
          started_at: string
          status: string
          total_scraped: number | null
          total_skipped: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          errors?: string[] | null
          filters?: Json | null
          id?: string
          results?: Json | null
          sources_requested?: string[]
          started_at?: string
          status?: string
          total_scraped?: number | null
          total_skipped?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          errors?: string[] | null
          filters?: Json | null
          id?: string
          results?: Json | null
          sources_requested?: string[]
          started_at?: string
          status?: string
          total_scraped?: number | null
          total_skipped?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      task_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          estimated_duration_days: number | null
          id: string
          is_active: boolean | null
          priority: number | null
          sort_order: number | null
          task_type: Database["public"]["Enums"]["task_type"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          estimated_duration_days?: number | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          sort_order?: number | null
          task_type?: Database["public"]["Enums"]["task_type"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          estimated_duration_days?: number | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          sort_order?: number | null
          task_type?: Database["public"]["Enums"]["task_type"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          created_at: string | null
          deal_id: string
          description: string | null
          due_date: string | null
          id: string
          priority: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          type: Database["public"]["Enums"]["task_type"] | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          created_at?: string | null
          deal_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          type?: Database["public"]["Enums"]["task_type"] | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          created_at?: string | null
          deal_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number | null
          start_date?: string | null
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
      unified_properties: {
        Row: {
          address: string
          ai_analysis: Json | null
          ai_arv: number | null
          ai_confidence: number | null
          ai_est_profit: number | null
          ai_reno_cost: number | null
          ai_score: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          coordinates: unknown | null
          council_data: Json | null
          created_at: string
          current_price: number | null
          date_scraped: string | null
          deal_id: string | null
          description: string | null
          district: string | null
          flip_potential: Database["public"]["Enums"]["flip_potential"] | null
          floor_area: number | null
          id: string
          land_area: number | null
          linz_data: Json | null
          listing_date: string | null
          market_analysis: Json | null
          parking_spaces: number | null
          photos: string[] | null
          price_history: Json | null
          property_type: string | null
          sale_date: string | null
          source_site: string | null
          source_url: string | null
          status: string | null
          suburb: string | null
          tags: string[] | null
          updated_at: string
          user_id: string | null
          year_built: number | null
        }
        Insert: {
          address: string
          ai_analysis?: Json | null
          ai_arv?: number | null
          ai_confidence?: number | null
          ai_est_profit?: number | null
          ai_reno_cost?: number | null
          ai_score?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          coordinates?: unknown | null
          council_data?: Json | null
          created_at?: string
          current_price?: number | null
          date_scraped?: string | null
          deal_id?: string | null
          description?: string | null
          district?: string | null
          flip_potential?: Database["public"]["Enums"]["flip_potential"] | null
          floor_area?: number | null
          id?: string
          land_area?: number | null
          linz_data?: Json | null
          listing_date?: string | null
          market_analysis?: Json | null
          parking_spaces?: number | null
          photos?: string[] | null
          price_history?: Json | null
          property_type?: string | null
          sale_date?: string | null
          source_site?: string | null
          source_url?: string | null
          status?: string | null
          suburb?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
          year_built?: number | null
        }
        Update: {
          address?: string
          ai_analysis?: Json | null
          ai_arv?: number | null
          ai_confidence?: number | null
          ai_est_profit?: number | null
          ai_reno_cost?: number | null
          ai_score?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          coordinates?: unknown | null
          council_data?: Json | null
          created_at?: string
          current_price?: number | null
          date_scraped?: string | null
          deal_id?: string | null
          description?: string | null
          district?: string | null
          flip_potential?: Database["public"]["Enums"]["flip_potential"] | null
          floor_area?: number | null
          id?: string
          land_area?: number | null
          linz_data?: Json | null
          listing_date?: string | null
          market_analysis?: Json | null
          parking_spaces?: number | null
          photos?: string[] | null
          price_history?: Json | null
          property_type?: string | null
          sale_date?: string | null
          source_site?: string | null
          source_url?: string | null
          status?: string | null
          suburb?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
          year_built?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_property_tag: {
        Args: { property_id: string; new_tag: string }
        Returns: undefined
      }
      can_access_deal: {
        Args: { deal_uuid: string }
        Returns: boolean
      }
      create_template_tasks_for_deal: {
        Args: { deal_uuid: string }
        Returns: undefined
      }
      get_current_user_team_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_properties_by_tags: {
        Args: { tag_filters: string[] }
        Returns: {
          address: string
          ai_analysis: Json | null
          ai_arv: number | null
          ai_confidence: number | null
          ai_est_profit: number | null
          ai_reno_cost: number | null
          ai_score: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          coordinates: unknown | null
          council_data: Json | null
          created_at: string
          current_price: number | null
          date_scraped: string | null
          deal_id: string | null
          description: string | null
          district: string | null
          flip_potential: Database["public"]["Enums"]["flip_potential"] | null
          floor_area: number | null
          id: string
          land_area: number | null
          linz_data: Json | null
          listing_date: string | null
          market_analysis: Json | null
          parking_spaces: number | null
          photos: string[] | null
          price_history: Json | null
          property_type: string | null
          sale_date: string | null
          source_site: string | null
          source_url: string | null
          status: string | null
          suburb: string | null
          tags: string[] | null
          updated_at: string
          user_id: string | null
          year_built: number | null
        }[]
      }
      remove_property_tag: {
        Args: { property_id: string; tag_to_remove: string }
        Returns: undefined
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
      task_status: "to_do" | "in_progress" | "review" | "done"
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
      task_status: ["to_do", "in_progress", "review", "done"],
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
