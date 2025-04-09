export interface User {
  id: string | null;
  name: string | null;
  username: string | null;
  token: string | null;
  status: string | null;

  birthday: string | null;
  profilePicture: string | null;
  timezone: string | null;
  password: string | null;

  groupIds: string[] | null;

}
