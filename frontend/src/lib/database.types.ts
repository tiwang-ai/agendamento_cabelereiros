export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      salons: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
          active: boolean
          business_hours: Json | null
          address: string | null
          phones: string[] | null
          general_info: string | null
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
          active?: boolean
          business_hours?: Json | null
          address?: string | null
          phones?: string[] | null
          general_info?: string | null
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
          active?: boolean
          business_hours?: Json | null
          address?: string | null
          phones?: string[] | null
          general_info?: string | null
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          role: 'super_admin' | 'support' | 'financial' | 'technical'
          active: boolean
          created_at: string
          last_sign_in_at: string | null
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          features: Json | null
          limits: Json | null
          active: boolean
          created_at: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          salon_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          created_at: string
          canceled_at: string | null
        }
      }
      usage_metrics: {
        Row: {
          id: string
          salon_id: string
          metric_name: string
          value: number
          measured_at: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          salon_id: string | null
          admin_user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          changes: Json | null
          created_at: string
        }
      }
      webhooks: {
        Row: {
          id: string
          salon_id: string
          url: string
          events: string[]
          active: boolean
          created_at: string
        }
      }
      salon_settings: {
        Row: {
          id: string
          salon_id: string
          settings: Json
          created_at: string
          updated_at: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      admin_role: 'super_admin' | 'support' | 'financial' | 'technical'
      ticket_status: 'open' | 'in_progress' | 'resolved' | 'closed'
    }
  }
}