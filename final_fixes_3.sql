ALTER TABLE IF EXISTS public.markets ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE IF EXISTS public.markets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Also check results table just in case it doesn't exist
CREATE TABLE IF NOT EXISTS public.results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    market_id VARCHAR(255) NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    open_patti VARCHAR(10),
    open_ank VARCHAR(5),
    close_ank VARCHAR(5),
    close_patti VARCHAR(10),
    UNIQUE(market_id, date)
);
