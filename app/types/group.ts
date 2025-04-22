import { User } from "./user";

export interface Group {
  id: string | null;
  name: string | null;
  description: string | null;
  image: string | null;
  adminId: string | null;
  users: User[] | null;
}
