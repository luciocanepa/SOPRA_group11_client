import { User } from "./user";

export interface Group {
  id: number | null;
  name: string | null;
  description: string | null;
  image: string | null;
  adminId: number | string | null;
  users: User[] | null;
}
