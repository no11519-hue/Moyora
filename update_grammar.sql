-- SQL Migration to correct grammatical truncations in Balance Game options
-- Run this in your Supabase SQL Editor

UPDATE games SET options = '["먼저 말함", "먼저 웃음"]' WHERE id = 'IB_C01';
UPDATE games SET options = '["바로", "천천히"]' WHERE id = 'IB_C09';
UPDATE games SET options = '["하이볼", "막걸리"]' WHERE id = 'DR_C10';
UPDATE games SET options = '["치킨", "삼겹살"]' WHERE id = 'DR_C11';
UPDATE games SET options = '["해장", "디저트"]' WHERE id = 'DR_C14';
UPDATE games SET options = '["간다", "안 간다"]' WHERE id = 'DR_C15';
UPDATE games SET options = '["남김", "안 남김"]' WHERE id = 'DR_C17';
UPDATE games SET options = '["직설", "부드럽게"]' WHERE id = 'CR_C04';
UPDATE games SET options = '["공개", "비공개"]' WHERE id = 'CR_C11';
UPDATE games SET options = '["짧게", "자세히"]' WHERE id = 'CR_C14';
