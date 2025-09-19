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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      products: {
        Row: {
          activo: boolean
          capacity_max: number
          capacity_min: number
          categoria: Database["public"]["Enums"]["category_type"]
          created_at: string
          description: string | null
          event_types: Database["public"]["Enums"]["event_type"][] | null
          id: string
          images: string[] | null
          name: string
          plan: Database["public"]["Enums"]["plan_type"]
          price: number
          provider_id: string
          space_types: Database["public"]["Enums"]["space_type"][] | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          capacity_max?: number
          capacity_min?: number
          categoria?: Database["public"]["Enums"]["category_type"]
          created_at?: string
          description?: string | null
          event_types?: Database["public"]["Enums"]["event_type"][] | null
          id?: string
          images?: string[] | null
          name: string
          plan?: Database["public"]["Enums"]["plan_type"]
          price: number
          provider_id: string
          space_types?: Database["public"]["Enums"]["space_type"][] | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          capacity_max?: number
          capacity_min?: number
          categoria?: Database["public"]["Enums"]["category_type"]
          created_at?: string
          description?: string | null
          event_types?: Database["public"]["Enums"]["event_type"][] | null
          id?: string
          images?: string[] | null
          name?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          price?: number
          provider_id?: string
          space_types?: Database["public"]["Enums"]["space_type"][] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_provider"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      provider_applications: {
        Row: {
          admin_observations: string | null
          company_name: string
          contact_email: string | null
          contact_last_name: string | null
          contact_name: string | null
          contact_phone: string
          created_at: string
          evidence_photos: string[] | null
          experience_description: string
          id: string
          logo_url: string | null
          nit: string
          product_category: string
          reviewed_at: string | null
          reviewed_by: string | null
          social_networks: string | null
          specialization: string
          status: string
          updated_at: string
          user_id: string
          years_experience: number
        }
        Insert: {
          admin_observations?: string | null
          company_name: string
          contact_email?: string | null
          contact_last_name?: string | null
          contact_name?: string | null
          contact_phone: string
          created_at?: string
          evidence_photos?: string[] | null
          experience_description: string
          id?: string
          logo_url?: string | null
          nit: string
          product_category: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_networks?: string | null
          specialization: string
          status?: string
          updated_at?: string
          user_id: string
          years_experience: number
        }
        Update: {
          admin_observations?: string | null
          company_name?: string
          contact_email?: string | null
          contact_last_name?: string | null
          contact_name?: string | null
          contact_phone?: string
          created_at?: string
          evidence_photos?: string[] | null
          experience_description?: string
          id?: string
          logo_url?: string | null
          nit?: string
          product_category?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_networks?: string | null
          specialization?: string
          status?: string
          updated_at?: string
          user_id?: string
          years_experience?: number
        }
        Relationships: []
      }
      provider_profiles: {
        Row: {
          application_id: string
          created_at: string
          id: string
          logo_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          logo_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_profiles_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "provider_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          quote_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          quote_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          quote_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string
          email: string
          email_sent_at: string | null
          event_date: string | null
          event_location: string | null
          event_time: string | null
          id: string
          pdf_url: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          email_sent_at?: string | null
          event_date?: string | null
          event_location?: string | null
          event_time?: string | null
          id?: string
          pdf_url?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          email_sent_at?: string | null
          event_date?: string | null
          event_location?: string | null
          event_time?: string | null
          id?: string
          pdf_url?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_auth_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_products_by_filters: {
        Args: {
          p_aforo?: number
          p_categoria?: string
          p_espacio?: string
          p_evento?: string
          p_plan?: string
          p_show_all?: boolean
        }
        Returns: {
          activo: boolean
          capacity_max: number
          capacity_min: number
          categoria: Database["public"]["Enums"]["category_type"]
          created_at: string
          description: string
          event_types: Database["public"]["Enums"]["event_type"][]
          id: string
          images: string[]
          name: string
          plan: Database["public"]["Enums"]["plan_type"]
          price: number
          provider_id: string
          provider_name: string
          space_types: Database["public"]["Enums"]["space_type"][]
          updated_at: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "administrator"
        | "collaborator"
        | "provider"
        | "admin"
        | "advisor"
      category_type:
        | "montaje_tecnico"
        | "decoracion_ambientacion"
        | "catering"
        | "mixologia_cocteleria"
        | "arte_cultura"
        | "audiovisuales"
        | "mobiliario"
      event_type:
        | "celebraciones_internas"
        | "activaciones_marca"
        | "team_building"
        | "cierre_ano"
        | "cumpleanos"
        | "dia_madre_padre"
        | "fechas_religiosas"
        | "graduaciones"
        | "reuniones_especiales"
        | "eventos_pequenos"
        | "eventos_medios"
        | "eventos_institucionales"
        | "encuentros_publicos"
        | "lanzamientos_aniversarios"
      plan_type: "basico" | "pro" | "premium"
      space_type:
        | "parques_publicos"
        | "jardines_botanicos"
        | "miradores_naturales"
        | "playas"
        | "plazoletas"
        | "calles_barrios"
        | "salones_eventos"
        | "teatros"
        | "auditorios"
        | "centros_convenciones"
        | "discotecas"
        | "restaurantes_privados"
        | "iglesias_templos"
        | "galerias_museos"
        | "bodegas"
        | "casas_patrimoniales"
        | "rooftops"
        | "locales_en_desuso"
        | "estudios"
        | "fincas_privadas"
        | "casas_familiares"
        | "unidades_residenciales"
        | "casas_patio_jardin"
        | "viviendas_adecuadas"
        | "carpas"
        | "contenedores"
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
      app_role: [
        "administrator",
        "collaborator",
        "provider",
        "admin",
        "advisor",
      ],
      category_type: [
        "montaje_tecnico",
        "decoracion_ambientacion",
        "catering",
        "mixologia_cocteleria",
        "arte_cultura",
        "audiovisuales",
        "mobiliario",
      ],
      event_type: [
        "celebraciones_internas",
        "activaciones_marca",
        "team_building",
        "cierre_ano",
        "cumpleanos",
        "dia_madre_padre",
        "fechas_religiosas",
        "graduaciones",
        "reuniones_especiales",
        "eventos_pequenos",
        "eventos_medios",
        "eventos_institucionales",
        "encuentros_publicos",
        "lanzamientos_aniversarios",
      ],
      plan_type: ["basico", "pro", "premium"],
      space_type: [
        "parques_publicos",
        "jardines_botanicos",
        "miradores_naturales",
        "playas",
        "plazoletas",
        "calles_barrios",
        "salones_eventos",
        "teatros",
        "auditorios",
        "centros_convenciones",
        "discotecas",
        "restaurantes_privados",
        "iglesias_templos",
        "galerias_museos",
        "bodegas",
        "casas_patrimoniales",
        "rooftops",
        "locales_en_desuso",
        "estudios",
        "fincas_privadas",
        "casas_familiares",
        "unidades_residenciales",
        "casas_patio_jardin",
        "viviendas_adecuadas",
        "carpas",
        "contenedores",
      ],
    },
  },
} as const
