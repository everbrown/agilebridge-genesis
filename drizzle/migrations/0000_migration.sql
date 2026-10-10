CREATE TABLE public.shared_breakdowns (
  id text PRIMARY KEY DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 16),
  title text NOT NULL DEFAULT 'Untitled breakdown',
  content_json jsonb NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.shared_breakdowns TO anon;
GRANT SELECT, INSERT ON public.shared_breakdowns TO authenticated;
GRANT ALL ON public.shared_breakdowns TO service_role;

ALTER TABLE public.shared_breakdowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone with the link can view shared breakdowns"
  ON public.shared_breakdowns FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Signed-in users can create their own shares"
  ON public.shared_breakdowns FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());