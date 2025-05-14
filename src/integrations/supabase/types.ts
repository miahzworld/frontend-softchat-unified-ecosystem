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
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          participants: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participants: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participants?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: []
      }
      crypto_settings: {
        Row: {
          conversion_rate_softpoints_to_usdt: number
          id: string
          min_kyc_level_for_withdrawal: number
          p2p_fee_percentage: number
          reward_rate_percentage: number
          transaction_fee_percentage: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          conversion_rate_softpoints_to_usdt?: number
          id?: string
          min_kyc_level_for_withdrawal?: number
          p2p_fee_percentage?: number
          reward_rate_percentage?: number
          transaction_fee_percentage?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          conversion_rate_softpoints_to_usdt?: number
          id?: string
          min_kyc_level_for_withdrawal?: number
          p2p_fee_percentage?: number
          reward_rate_percentage?: number
          transaction_fee_percentage?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      crypto_transactions: {
        Row: {
          amount: number
          created_at: string | null
          crypto_type: string
          fee: number
          id: string
          notes: string | null
          recipient_id: string | null
          status: string
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          crypto_type: string
          fee?: number
          id?: string
          notes?: string | null
          recipient_id?: string | null
          status?: string
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          crypto_type?: string
          fee?: number
          id?: string
          notes?: string | null
          recipient_id?: string | null
          status?: string
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      p2p_offers: {
        Row: {
          amount: number
          created_at: string | null
          crypto_type: string
          expires_at: string
          id: string
          notes: string | null
          offer_type: string
          payment_method: string
          price_per_unit: number
          status: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          crypto_type: string
          expires_at: string
          id?: string
          notes?: string | null
          offer_type: string
          payment_method: string
          price_per_unit: number
          status?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          crypto_type?: string
          expires_at?: string
          id?: string
          notes?: string | null
          offer_type?: string
          payment_method?: string
          price_per_unit?: number
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          filter: string | null
          id: string
          image_url: string | null
          softpoints: number | null
          tags: string[] | null
          type: string | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          filter?: string | null
          id?: string
          image_url?: string | null
          softpoints?: number | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          filter?: string | null
          id?: string
          image_url?: string | null
          softpoints?: number | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          boost_until: string | null
          category: string | null
          created_at: string
          description: string
          discount_price: number | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          is_featured: boolean | null
          is_sponsored: boolean | null
          name: string
          price: number
          rating: number | null
          review_count: number | null
          seller_id: string
          updated_at: string
        }
        Insert: {
          boost_until?: string | null
          category?: string | null
          created_at?: string
          description: string
          discount_price?: number | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          name: string
          price: number
          rating?: number | null
          review_count?: number | null
          seller_id: string
          updated_at?: string
        }
        Update: {
          boost_until?: string | null
          category?: string | null
          created_at?: string
          description?: string
          discount_price?: number | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          name?: string
          price?: number
          rating?: number | null
          review_count?: number | null
          seller_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          avatar_url: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          is_verified: boolean | null
          level: string | null
          name: string | null
          points: number | null
          preferences: Json | null
          role: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          avatar?: string | null
          avatar_url?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          is_verified?: boolean | null
          level?: string | null
          name?: string | null
          points?: number | null
          preferences?: Json | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          avatar?: string | null
          avatar_url?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          is_verified?: boolean | null
          level?: string | null
          name?: string | null
          points?: number | null
          preferences?: Json | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          btc_balance: number
          created_at: string | null
          eth_balance: number
          id: string
          kyc_documents: Json | null
          kyc_level: number
          kyc_verified: boolean
          softpoints_balance: number
          sol_balance: number
          updated_at: string | null
          usdt_balance: number
          user_id: string | null
        }
        Insert: {
          btc_balance?: number
          created_at?: string | null
          eth_balance?: number
          id?: string
          kyc_documents?: Json | null
          kyc_level?: number
          kyc_verified?: boolean
          softpoints_balance?: number
          sol_balance?: number
          updated_at?: string | null
          usdt_balance?: number
          user_id?: string | null
        }
        Update: {
          btc_balance?: number
          created_at?: string | null
          eth_balance?: number
          id?: string
          kyc_documents?: Json | null
          kyc_level?: number
          kyc_verified?: boolean
          softpoints_balance?: number
          sol_balance?: number
          updated_at?: string | null
          usdt_balance?: number
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_column_exists: {
        Args: { table_name: string; column_name: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
