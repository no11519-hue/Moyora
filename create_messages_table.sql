-- Create room_messages table to store chat answers
CREATE TABLE IF NOT EXISTS room_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL,
    question_id TEXT NOT NULL,
    nickname TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;

-- Allow public access (for MVP simplicity, restrict later if needed)
CREATE POLICY "Enable all for room_messages" ON room_messages FOR ALL USING (true) WITH CHECK (true);
