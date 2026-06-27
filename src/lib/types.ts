export interface SmsLog {
  id: string;
  phone: string;
  message: string;
  api_key_hint: string;
  status: string;
  text_id: string;
  quota_remaining: number;
  error: string;
  created_at: string;
}
