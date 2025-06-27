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
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: 'super_admin' | 'admin' | 'salon' | 'user'
          status: 'active' | 'pending' | 'suspended'
          join_date: string
          last_login: string | null
          avatar: string | null
          permissions: string[] | null
          password_hash: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          role: 'super_admin' | 'admin' | 'salon' | 'user'
          status?: 'active' | 'pending' | 'suspended'
          join_date?: string
          last_login?: string | null
          avatar?: string | null
          permissions?: string[] | null
          password_hash: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          role?: 'super_admin' | 'admin' | 'salon' | 'user'
          status?: 'active' | 'pending' | 'suspended'
          join_date?: string
          last_login?: string | null
          avatar?: string | null
          permissions?: string[] | null
          password_hash?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      salon_owners: {
        Row: {
          user_id: string
          total_salons: number | null
          total_revenue: number | null
          total_bookings: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          total_salons?: number | null
          total_revenue?: number | null
          total_bookings?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          total_salons?: number | null
          total_revenue?: number | null
          total_bookings?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      customers: {
        Row: {
          user_id: string
          total_spent: number | null
          total_bookings: number | null
          favorite_services: string[] | null
          suspension_reason: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          total_spent?: number | null
          total_bookings?: number | null
          favorite_services?: string[] | null
          suspension_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          total_spent?: number | null
          total_bookings?: number | null
          favorite_services?: string[] | null
          suspension_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      salons: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          address: string | null
          location: string | null
          status: 'active' | 'pending' | 'suspended'
          join_date: string
          revenue: number | null
          bookings: number | null
          rating: number | null
          services: string[] | null
          hours: Json | null
          website: string | null
          description: string | null
          business_license: string | null
          tax_id: string | null
          images: string[] | null
          owner_id: string
          owner_name: string | null
          owner_email: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          address?: string | null
          location?: string | null
          status?: 'active' | 'pending' | 'suspended'
          join_date?: string
          revenue?: number | null
          bookings?: number | null
          rating?: number | null
          services?: string[] | null
          hours?: Json | null
          website?: string | null
          description?: string | null
          business_license?: string | null
          tax_id?: string | null
          images?: string[] | null
          owner_id: string
          owner_name?: string | null
          owner_email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          address?: string | null
          location?: string | null
          status?: 'active' | 'pending' | 'suspended'
          join_date?: string
          revenue?: number | null
          bookings?: number | null
          rating?: number | null
          services?: string[] | null
          hours?: Json | null
          website?: string | null
          description?: string | null
          business_license?: string | null
          tax_id?: string | null
          images?: string[] | null
          owner_id?: string
          owner_name?: string | null
          owner_email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          price: number
          yearly_price: number
          description: string | null
          features: string[] | null
          limits: Json | null
          popular: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          price: number
          yearly_price: number
          description?: string | null
          features?: string[] | null
          limits?: Json | null
          popular?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          price?: number
          yearly_price?: number
          description?: string | null
          features?: string[] | null
          limits?: Json | null
          popular?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          salon_id: string
          plan_id: string
          status: 'active' | 'trial' | 'cancelled' | 'past_due'
          start_date: string
          next_billing_date: string
          amount: number
          billing_cycle: string
          usage: Json | null
          payment_method: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          salon_id: string
          plan_id: string
          status: 'active' | 'trial' | 'cancelled' | 'past_due'
          start_date: string
          next_billing_date: string
          amount: number
          billing_cycle: string
          usage?: Json | null
          payment_method?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          salon_id?: string
          plan_id?: string
          status?: 'active' | 'trial' | 'cancelled' | 'past_due'
          start_date?: string
          next_billing_date?: string
          amount?: number
          billing_cycle?: string
          usage?: Json | null
          payment_method?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      billing_history: {
        Row: {
          id: string
          subscription_id: string
          date: string
          amount: number
          status: string
          description: string | null
          invoice_number: string | null
          tax_amount: number | null
          subtotal: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          subscription_id: string
          date: string
          amount: number
          status: string
          description?: string | null
          invoice_number?: string | null
          tax_amount?: number | null
          subtotal?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          subscription_id?: string
          date?: string
          amount?: number
          status?: string
          description?: string | null
          invoice_number?: string | null
          tax_amount?: number | null
          subtotal?: number | null
          created_at?: string | null
        }
      }
      mobile_devices: {
        Row: {
          id: string
          user_id: string
          device_token: string
          device_type: string
          last_login: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          device_token: string
          device_type: string
          last_login?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          device_token?: string
          device_type?: string
          last_login?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      services: {
        Row: {
          id: string
          salon_id: string
          name: string
          description: string | null
          price: number
          duration: number
          category: string | null
          image: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          salon_id: string
          name: string
          description?: string | null
          price: number
          duration: number
          category?: string | null
          image?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          salon_id?: string
          name?: string
          description?: string | null
          price?: number
          duration?: number
          category?: string | null
          image?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      staff: {
        Row: {
          id: string
          salon_id: string
          name: string
          email: string | null
          phone: string | null
          role: string | null
          bio: string | null
          avatar: string | null
          services: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          salon_id: string
          name: string
          email?: string | null
          phone?: string | null
          role?: string | null
          bio?: string | null
          avatar?: string | null
          services?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          salon_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          role?: string | null
          bio?: string | null
          avatar?: string | null
          services?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          salon_id: string
          service_id: string
          staff_id: string
          date: string
          duration: number
          status: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          salon_id: string
          service_id: string
          staff_id: string
          date: string
          duration: number
          status: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          salon_id?: string
          service_id?: string
          staff_id?: string
          date?: string
          duration?: number
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}