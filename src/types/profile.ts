// Frontend-only profile types
// This keeps frontend code independent from Prisma backend types

export interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  created_at: Date;
  updated_at: Date;
}

// API response wrapper types
export interface ProfileApiResponse {
  success: boolean;
  data: ProfileData;
}

export interface ProfileApiError {
  success: false;
  error: string;
}
