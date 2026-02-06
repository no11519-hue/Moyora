-- SQL Migration to correct abbreviated prompts in Question/Balance games
-- Run this in your Supabase SQL Editor

UPDATE games SET prompt = '소개 스타일' WHERE id = 'IB_C02';
UPDATE games SET prompt = '말하는 스타일' WHERE id = 'IB_C07';
UPDATE games SET prompt = '호감 포인트 3~4글자!' WHERE id = 'DM_Q01';
UPDATE games SET prompt = '설렘 포인트 3~4글자!' WHERE id = 'DM_Q02';
UPDATE games SET prompt = '2차 장소 3~4글자!' WHERE id = 'DR_Q06';
UPDATE games SET prompt = '웃음 참는 법 3~4글자!' WHERE id = 'DR_Q09';
UPDATE games SET prompt = '오늘의 레전드 3~4글자!' WHERE id = 'DR_Q10';
UPDATE games SET prompt = '우리 팀 별명 3~4글자!' WHERE id = 'CR_Q01';
UPDATE games SET prompt = '칭찬 한마디 3~4글자!' WHERE id = 'CR_Q07';
UPDATE games SET prompt = '고생 포인트 3~4글자!' WHERE id = 'CR_Q08';
