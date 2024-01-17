export interface User {
  id: string;
  password?: string;
  email?: string;
  last_logged_in?: Date;
  role?: string;
  ct_customer_id?: string;
}
