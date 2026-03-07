
-- Knowledge cache table to store diagnostic knowledge from web sources
CREATE TABLE public.knowledge_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  query_key TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('youtube', 'reddit', 'manual', 'web')),
  brand TEXT,
  model TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT,
  relevance_score REAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days')
);

-- Index for fast lookups
CREATE INDEX idx_knowledge_cache_lookup ON public.knowledge_cache (category, query_key);
CREATE INDEX idx_knowledge_cache_brand ON public.knowledge_cache (brand) WHERE brand IS NOT NULL;
CREATE INDEX idx_knowledge_cache_expires ON public.knowledge_cache (expires_at);

-- Enable RLS
ALTER TABLE public.knowledge_cache ENABLE ROW LEVEL SECURITY;

-- Public read access (diagnostic knowledge is shared)
CREATE POLICY "Knowledge cache is publicly readable"
  ON public.knowledge_cache FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (edge functions use service role)
CREATE POLICY "Service role can manage knowledge cache"
  ON public.knowledge_cache FOR ALL
  USING (auth.role() = 'service_role');
