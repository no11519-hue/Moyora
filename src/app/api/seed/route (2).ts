
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GAME_DATA } from '@/data/gameData';

export async function GET() {
    try {
        // 1. Clear existing questions
        await supabase
            .from('questions')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        // 2. Prepare data
        const rows = [];
        for (const cat of GAME_DATA.categories) {
            for (const q of cat.games) {
                rows.push({
                    category: cat.id,
                    content: q.question,
                    type: q.type,
                    options: q.options ? JSON.stringify(q.options) : null,
                    timer: q.timer
                });
            }
        }

        // 3. Bulk Insert
        const { data, error } = await supabase
            .from('questions')
            .insert(rows)
            .select();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: `Seeded ${data.length} games successfully!`,
            data
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
