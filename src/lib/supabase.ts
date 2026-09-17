import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// You need to create a Supabase project at https://supabase.com
// Then get your project URL and anon key from Settings > API

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          category: string;
          image_url: string;
          available: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>;
      };
      tables: {
        Row: {
          id: string;
          number: number;
          status: 'available' | 'occupied' | 'dirty' | 'reserved';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tables']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tables']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          table_number: number;
          customer_name: string;
          customer_phone: string;
          items: any;
          total_amount: number;
          status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
          customer_note: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      staff: {
        Row: {
          id: string;
          name: string;
          username: string;
          password: string;
          role: 'admin' | 'kitchen' | 'waiter';
          phone: string;
          email: string;
          active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['staff']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['staff']['Insert']>;
      };
      settings: {
        Row: {
          id: string;
          name: string;
          address: string;
          phone: string;
          currency: string;
          tax_rate: number;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['settings']['Insert']>;
      };
    };
  };
}
