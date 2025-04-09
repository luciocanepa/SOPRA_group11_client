import { User } from "./user";

export interface Group {
    id: string | null;
    name: string | null;
    description: string | null;
    token: string | null;
    image: string | null;
    adminId: string | null;
    members: User[] | null;
  }

