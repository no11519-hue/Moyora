-- Enable RLS on room_messages table
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;

-- Allow SELECT for everyone (anon and authenticated)
-- This allows ResultView to fetch messages
CREATE POLICY "Allow public select room_messages" 
ON room_messages FOR SELECT 
USING (true);

-- Allow INSERT for everyone (anon and authenticated)
-- This allows VotingView to insert messages
CREATE POLICY "Allow public insert room_messages" 
ON room_messages FOR INSERT 
WITH CHECK (true);
