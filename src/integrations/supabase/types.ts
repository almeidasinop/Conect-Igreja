export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: number
          image_url: string | null
          title: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: number
          image_url?: string | null
          title: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: number
          image_url?: string | null
          title?: string
        }
        Relationships: []
      }
      anonymous_fcm_tokens: {
        Row: {
          created_at: string | null
          fcm_token: string
          id: string
        }
        Insert: {
          created_at?: string | null
          fcm_token: string
          id?: string
        }
        Update: {
          created_at?: string | null
          fcm_token?: string
          id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          type?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          author_id: string
          body: string
          created_at: string | null
          id: number
          title: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string | null
          id?: number
          title: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string | null
          id?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_items_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      event_roles: {
        Row: {
          created_at: string | null
          event_id: number
          id: number
          required_count: number
          role_name: string
        }
        Insert: {
          created_at?: string | null
          event_id: number
          id?: number
          required_count: number
          role_name: string
        }
        Update: {
          created_at?: string | null
          event_id?: number
          id?: number
          required_count?: number
          role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_roles_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_targeted_groups: {
        Row: {
          event_id: number
          group_id: string
          id: number
        }
        Insert: {
          event_id: number
          group_id: string
          id?: number
        }
        Update: {
          event_id?: number
          group_id?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_targeted_groups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_targeted_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      event_volunteers: {
        Row: {
          created_at: string | null
          event_role_id: number
          id: number
          member_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          event_role_id: number
          id?: number
          member_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          event_role_id?: number
          id?: number
          member_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_volunteers_event_role_id_fkey"
            columns: ["event_role_id"]
            isOneToOne: false
            referencedRelation: "event_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_volunteers_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          author_id: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          id: number
          image_url: string | null
          is_all_day: boolean | null
          location: string | null
          recurrence_rule: string | null
          start_time: string
          targeted_group_ids: string[] | null
          title: string
          visibility: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: number
          image_url?: string | null
          is_all_day?: boolean | null
          location?: string | null
          recurrence_rule?: string | null
          start_time: string
          targeted_group_ids?: string[] | null
          title: string
          visibility?: string
        }
        Update: {
          author_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: number
          image_url?: string | null
          is_all_day?: boolean | null
          location?: string | null
          recurrence_rule?: string | null
          start_time?: string
          targeted_group_ids?: string[] | null
          title?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      group_types: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          leader_id: string | null
          location: string | null
          meeting_day: string | null
          meeting_time: string | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          location?: string | null
          meeting_day?: string | null
          meeting_time?: string | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          location?: string | null
          meeting_day?: string | null
          meeting_time?: string | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      member_groups: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          member_id: string
          role: string | null
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          member_id: string
          role?: string | null
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          member_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_groups_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          baptism_date: string | null
          conversion_date: string | null
          created_at: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          marital_status: string | null
          member_number: string | null
          notes: string | null
          origin_church: string | null
          profession: string | null
          profile_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          baptism_date?: string | null
          conversion_date?: string | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          marital_status?: string | null
          member_number?: string | null
          notes?: string | null
          origin_church?: string | null
          profession?: string | null
          profile_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          baptism_date?: string | null
          conversion_date?: string | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          marital_status?: string | null
          member_number?: string | null
          notes?: string | null
          origin_church?: string | null
          profession?: string | null
          profile_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_requests: {
        Row: {
          created_at: string
          id: string
          is_answered: boolean | null
          request_text: string
          user_id: string | null
          visitor_name: string | null
          visitor_phone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_answered?: boolean | null
          request_text: string
          user_id?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_answered?: boolean | null
          request_text?: string
          user_id?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prayer_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_roles: {
        Row: {
          created_at: string | null
          id: number
          profile_id: string
          role_name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          profile_id: string
          role_name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          profile_id?: string
          role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          azure_person_id: string | null
          birth_date: string | null
          city: string | null
          created_at: string | null
          email: string
          face_descriptor: string | null
          full_name: string
          id: string
          phone: string | null
          role: string
          state: string | null
          updated_at: string | null
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          azure_person_id?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          face_descriptor?: string | null
          full_name: string
          id?: string
          phone?: string | null
          role?: string
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          azure_person_id?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          face_descriptor?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: number
          is_allowed: boolean
          permission: string
          role: string
        }
        Insert: {
          created_at?: string
          id?: never
          is_allowed?: boolean
          permission: string
          role: string
        }
        Update: {
          created_at?: string
          id?: never
          is_allowed?: boolean
          permission?: string
          role?: string
        }
        Relationships: []
      }
      transaction_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          category_name: string | null
          created_at: string | null
          date: string
          description: string | null
          id: number
          member_id: string | null
          receipt_url: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          category_name?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: number
          member_id?: string | null
          receipt_url?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          category_name?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: number
          member_id?: string | null
          receipt_url?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_transaction_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          description: string | null
          id: number
          role_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: never
          role_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: never
          role_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      profile_roles_with_role: {
        Row: {
          profile_id: string | null
          role_count: number | null
          role_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_role"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles_with_role: {
        Row: {
          email: string | null
          full_name: string | null
          id: string | null
          role_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_financial_summary_current_month: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_income: number
          total_expense: number
          balance: number
        }[]
      }
      get_member_status_distribution: {
        Args: Record<PropertyKey, never>
        Returns: {
          status: string
          count: number
        }[]
      }
      get_monthly_cash_flow: {
        Args: { num_months: number }
        Returns: {
          month: string
          income: number
          expense: number
        }[]
      }
      get_monthly_member_growth: {
        Args: { num_months: number }
        Returns: {
          month: string
          count: number
        }[]
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_top_groups_by_members: {
        Args: { limit_count: number }
        Returns: {
          name: string
          member_count: number
        }[]
      }
      get_total_balance: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_total_transactions_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_transaction_distribution_current_month: {
        Args: { p_type: string }
        Returns: {
          category_name: string
          total_amount: number
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_visible_events: {
        Args:
          | Record<PropertyKey, never>
          | { user_id?: string; user_group_ids?: string[] }
        Returns: {
          author_id: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          id: number
          image_url: string | null
          is_all_day: boolean | null
          location: string | null
          recurrence_rule: string | null
          start_time: string
          targeted_group_ids: string[] | null
          title: string
          visibility: string
        }[]
      }
      is_valid_date: {
        Args: { p_text: string }
        Returns: boolean
      }
      user_has_role: {
        Args: { p_user_id: string; p_role_name: string }
        Returns: boolean
      }
    }
    Enums: {
      volunteer_status: "pendente" | "confirmado" | "rejeitado"
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
    Enums: {
      volunteer_status: ["pendente", "confirmado", "rejeitado"],
    },
  },
} as const
