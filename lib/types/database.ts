// lib/types/database.ts
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          user_type: "admin" | "contractor" | "buyer" | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          user_type?: "admin" | "contractor" | "buyer" | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      contractors: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          business_permit: string | null;
          pcab_license: string | null;
          bir_registration: string | null;
          years_in_business: number | null;
          team_size: number | null;
          certifications: string[] | null;
          verification_status: "pending" | "verified" | "rejected";
          verification_score: number;
          tier: "bronze" | "silver" | "gold" | "platinum" | null;
          total_projects_completed: number;
          average_rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["contractors"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["contractors"]["Insert"]>;
      };
      // ... add other table types similarly
    };
  };
};

// lib/types/index.ts
export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type Contractor = Database["public"]["Tables"]["contractors"]["Row"];
export type Buyer = Database["public"]["Tables"]["buyers"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectUpdate =
  Database["public"]["Tables"]["project_updates"]["Row"];
export type Inspection = Database["public"]["Tables"]["inspections"]["Row"];
export type BudgetItem = Database["public"]["Tables"]["budget_items"]["Row"];
