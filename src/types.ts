export type Role = 'Operator' | 'Kepala Sekolah' | 'Guru';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
}
