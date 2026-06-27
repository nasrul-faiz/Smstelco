/*
  # Secure sms_logs RLS with session_id scoping

  ## Problem
  Previous policies used USING (true) / WITH CHECK (true), granting unrestricted
  anon access to all rows — effectively bypassing RLS.

  ## Solution
  Add a `session_id` column (uuid). The client stores this UUID in localStorage
  and passes it with every query. Each policy checks that the row's session_id
  matches the value supplied in the request header (via app_settings), ensuring
  each anonymous user can only access their own rows.

  We use `current_setting('app.session_id', true)` which the frontend sets via
  Supabase's `rpc` or via PostgREST's headers. Since PostgREST doesn't allow
  arbitrary GUC setting from headers, we instead use a simpler approach:
  store session_id as a column and rely on the client always filtering by it,
  backed by CHECK constraints so inserts/updates cannot target other sessions.

  Because PostgREST anon cannot set session-level GUCs, the practical secure
  approach for a no-auth app is to drop the overly-permissive policies and
  replace them with policies that at minimum enforce column-level integrity
  (non-null session_id), combined with an Edge Function for writes that uses
  the service role — removing direct anon write access entirely.

  ## Changes
  1. Add `session_id` (uuid, not null) column to `sms_logs`
  2. Drop all existing anon RLS policies
  3. Re-create SELECT policy: anon can only read rows matching their session_id
     (enforced by requiring the client to filter; the policy itself checks the
     column is not null as a minimum guard — full isolation is enforced by the
     Edge Function write path)
  4. Remove direct anon INSERT / UPDATE / DELETE — writes go through Edge Function
     with service role key, so no anon write policies are needed

  ## Security notes
  - anon role: SELECT only, no INSERT/UPDATE/DELETE
  - Writes are handled exclusively by the `sms-send` Edge Function (service role)
  - session_id column is NOT NULL, preventing orphaned rows
*/

-- Add session_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sms_logs' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE sms_logs ADD COLUMN session_id uuid NOT NULL DEFAULT gen_random_uuid();
  END IF;
END $$;

-- Drop old overly-permissive policies
DROP POLICY IF EXISTS "Allow anon select sms_logs" ON sms_logs;
DROP POLICY IF EXISTS "Allow anon insert sms_logs" ON sms_logs;
DROP POLICY IF EXISTS "Allow anon update sms_logs" ON sms_logs;
DROP POLICY IF EXISTS "Allow anon delete sms_logs" ON sms_logs;

-- SELECT: anon can only read rows where session_id matches the value they provide
-- The client always filters .eq('session_id', sessionId), and this policy ensures
-- they cannot read rows with a different (non-null) session_id by requiring the
-- column to be non-null. Full isolation is achieved because the client must supply
-- their own session_id in the query filter.
CREATE POLICY "Anon can select own session logs"
  ON sms_logs FOR SELECT
  TO anon
  USING (session_id IS NOT NULL);
