
import { GameData } from '@/types/game';

export const GAME_DATA: GameData = {
    categories: [
        {
            id: "icebreaking",
            title: "🧊 아이스브레이킹",
            description: "어색한 공기를 3초 만에 깨부수는 가벼운 질문",
            games: [
                {
                    type: "vote_blind",
                    question: "학창 시절에 선생님 몰래 딴짓을 가장 많이 했을 것 같은 사람은?",
                    options: ["참여자 전원"],
                    timer: 15
                },
                {
                    type: "mission_action",
                    question: "모두 스마트폰을 꺼내 서로의 '배경화면'을 보여주고 의미를 설명하세요!",
                    timer: 60
                },
                {
                    type: "vote_image",
                    question: "오늘의 '베스트 드레서'는 누구인가요? (패션 센스 투표)",
                    options: ["참여자 전원"],
                    timer: 20
                },
                {
                    type: "balance_light",
                    question: "평생 한 가지 음식만 먹어야 한다면?",
                    options: ["라면", "치킨"],
                    timer: 10
                },
                // Added Randoms
                { type: "balance_light", question: "무인도에 딱 하나만 가져간다면?", options: ["스마트폰", "친구"], timer: 10 },
                { type: "mission_action", question: "지금 바로 왼쪽 사람의 '장점'을 딱 하나만 찾아 칭찬해주세요!", timer: 30 },
                { type: "mission_action", question: "오른쪽 사람과 5초 동안 눈 마주치기! 먼저 웃는 사람이 벌칙!", timer: 15 },
                { type: "vote_blind", question: "학창시절 별명이 가장 웃길 것 같은 사람은?", options: ["참여자 전원"], timer: 15 },
                { type: "vote_image", question: "동물로 비유하면 나무늘보일 것 같은 사람은?", options: ["참여자 전원"], timer: 15 },
                { type: "balance_light", question: "초능력 선택!", options: ["순간이동", "마음읽기"], timer: 10 },
                { type: "balance_light", question: "여름에 겨울옷 vs 겨울에 여름옷", options: ["쪄죽음", "얼어죽음"], timer: 10 },
                { type: "balance_light", question: "평생 커피 끊기 vs 평생 라면 끊기", options: ["No 커피", "No 라면"], timer: 10 },
                { type: "balance_light", question: "민트초코?", options: ["호", "불호"], timer: 10 },
                { type: "balance_light", question: "탕수육은?", options: ["부먹", "찍먹"], timer: 10 },
            ]
        },
        {
            id: "dating",
            title: "💕 두근두근 소개팅",
            description: "서로의 호감과 가치관을 은근슬쩍 확인하는 질문",
            games: [
                {
                    type: "vote_signal",
                    question: "첫인상이 가장 내 이상형에 가까웠던 사람은? (익명 보장)",
                    options: ["이성 참여자만 노출"],
                    timer: 15
                },
                {
                    type: "balance_love",
                    question: "더 용서할 수 없는 애인의 행동은?",
                    options: ["이성친구와 단둘이 술", "전 애인과 안부 연락"],
                    timer: 10
                },
                {
                    type: "mission_action",
                    question: "오른쪽 사람과 10초 동안 눈을 마주치고(아이컨택), 먼저 웃는 사람이 벌칙!",
                    timer: 15
                },
                {
                    type: "vote_blind",
                    question: "오늘 이 자리에서 애프터 신청을 받을 것 같은 인기쟁이는?",
                    options: ["참여자 전원"],
                    timer: 15
                },
                // Added Randoms
                { type: "balance_love", question: "연락 문제, 뭐가 더 최악?", options: ["잠수 타기", "1분마다 카톡"], timer: 10 },
                { type: "balance_love", question: "기념일 선물 취향은?", options: ["서프라이즈", "대놓고 묻기"], timer: 10 },
                { type: "balance_love", question: "깻잎 논쟁?", options: ["상관없음", "절대 안됨"], timer: 10 },
                { type: "balance_love", question: "이별 후 친구 가능?", options: ["가능", "불가능"], timer: 10 },
                { type: "vote_signal", question: "눈빛이 가장 매력적인 사람은?", options: ["이성 참여자만 노출"], timer: 15 },
                { type: "vote_signal", question: "목소리가 가장 설레는 사람은?", options: ["이성 참여자만 노출"], timer: 15 },
                { type: "balance_love", question: "데이트 비용은?", options: ["데이트 통장", "번갈아 내기"], timer: 10 },
                { type: "balance_love", question: "사내 연애(CC)?", options: ["찬성", "절대 반대"], timer: 10 },
            ]
        },
        {
            id: "workshop",
            title: "🔥 으쌰으쌰 워크숍",
            description: "팀워크를 다지고 칭찬으로 훈훈하게 마무리",
            games: [
                {
                    type: "vote_praise",
                    question: "우리 팀의 '숨은 해결사'는 누구인가요? (가장 의지되는 사람)",
                    options: ["참여자 전원"],
                    timer: 20
                },
                {
                    type: "mission_action",
                    question: "모두 일어나서 옆 사람과 하이파이브 3번! 가장 늦은 사람은 벌칙!",
                    timer: 20
                },
                {
                    type: "mission_coop",
                    question: "지금 바로 왼쪽 사람의 어깨를 10초간 안마해주고 칭찬 한마디 건네세요!",
                    timer: 15
                },
                {
                    type: "vote_fun",
                    question: "나중에 회사를 그만두고 유튜버로 대박날 것 같은 사람은?",
                    options: ["참여자 전원"],
                    timer: 15
                },
                // Added
                { type: "vote_praise", question: "오늘 워크숍 열정왕은 누구?", options: ["참여자 전원"], timer: 15 },
                { type: "vote_praise", question: "업무 칼답장 스피드 레이서는?", options: ["참여자 전원"], timer: 15 },
                { type: "vote_praise", question: "우리 팀 공식 쩝쩝박사(맛집 전문가)는?", options: ["참여자 전원"], timer: 15 },
                { type: "mission_action", question: "팀원 전체가 일어나서 '파이팅' 구호 외치기! (3초 안에)", timer: 10 },
                { type: "mission_coop", question: "팀원 칭찬 릴레이 시작! (끊키면 벌칙)", timer: 60 },
            ]
        },
        {
            id: "drinking",
            title: "🍻 술자리 게임",
            description: "텐션 UP! 벌칙과 밸런스가 난무하는 매운맛",
            games: [
                {
                    type: "balance_spicy",
                    question: "100% 확률로 1억 받기 vs 50% 확률로 100억 받기 (실패시 0원)",
                    options: ["무조건 1억", "인생 한방 100억"],
                    timer: 5
                },
                {
                    type: "roulette_punishment",
                    question: "러시안 룰렛! 걸린 사람은 '건배사' 제창하고 원샷",
                    options: ["랜덤 1인 지목"],
                    timer: 10
                },
                {
                    type: "vote_image",
                    question: "취하면 가장 먼저 집에 갈 것 같은(혹은 흑역사 생성할) 사람은?",
                    options: ["참여자 전원"],
                    timer: 15
                },
                {
                    type: "mission_action",
                    question: "지금부터 3분간 영어 금지! (쓰는 순간 벌주)",
                    timer: 180
                },
                // Added
                { type: "balance_spicy", question: "통장 잔고 공개 vs 흑역사 사진 공개", options: ["잔고 공개", "흑역사 공개"], timer: 10 },
                { type: "balance_spicy", question: "전 애인 이름 크게 외치기 vs 소주 원샷", options: ["이름 외치기", "소주 원샷"], timer: 5 },
                { type: "mission_action", question: "지금 쓰고 있는 모자/안경 벗기 (안하면 한잔)", timer: 10 },
                { type: "mission_action", question: "왼쪽 사람 칭찬 3가지 하기 (못하면 한잔)", timer: 20 },
                { type: "vote_image", question: "가장 변태(?)일 것 같은 사람은?", options: ["참여자 전원"], timer: 15 },
                { type: "vote_image", question: "오늘 집에 안 들어갈 것 같은 멤버는?", options: ["참여자 전원"], timer: 15 },
            ]
        }
    ]
}
