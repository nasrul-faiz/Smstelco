/*
  # Create SMS Logs Table

  1. New Tables
    - `sms_logs`
      - `id` (uuid, primary key)
      - `phone` (text) - recipient phone number
      - `message` (text) - message content
      - `api_key` (text) - textbelt API key used (masked for display)
      - `status` (text) - DELIVERED, SENT, SENDING, FAILED, UNKNOWN, PENDING
      - `text_id` (text) - textbelt textId for status lookups
      - `quota_remaining` (integer) - quota left after send
      - `error` (text) - error message if failed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `sms_logs` table
    - Allow anonymous read/write since this is a single-user developer tool
*/

CREATE TABLE IF NOT EXISTS sms_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  message text NOT NULL,
  api_key_hint text DEFAULT '',
  status text NOT NULL DEFAULT 'PENDING',
  text_id text DEFAULT '',
  quota_remaining integer DEFAULT -1,
  error text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select sms_logs"
  ON sms_logs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert sms_logs"
  ON sms_logs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update sms_logs"
  ON sms_logs FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete sms_logs"
  ON sms_logs FOR DELETE
  TO anon
  USING (true);
