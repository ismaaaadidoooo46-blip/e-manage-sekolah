export type Role = 'OPERATOR' | 'KEPALA_SEKOLAH' | 'GURU' | 'SISWA';

export interface User {
  id: string;
  username: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}
