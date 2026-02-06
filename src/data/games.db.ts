// ==========================
// 게임 데이터 및 타입 정의
// ==========================

export type Theme = "아이스브레이킹" | "소개팅·미팅" | "회식·술자리" | "크루모드";
export type GameType = "Q" | "C";

export type QuestionGame = {
    id: string;
    theme: Theme;
    type: "Q";
    timeSec: 20;
    prompt: string; // 3~4글자 입력 유도
};

export type ChoiceGame = {
    id: string;
    theme: Theme;
    type: "C";
    timeSec: 10;
    prompt: string;
    A: string;
    B: string;
};

export type Game = QuestionGame | ChoiceGame;

export const GAME_DB: Game[] = [
    // ------------------------------------------------------------
    // 아이스브레이킹: 질문형 10
    // ------------------------------------------------------------
    { id: "IB_Q01", theme: "아이스브레이킹", type: "Q", timeSec: 20, prompt: "내 첫인상 3~4글자!" },
    { id: "IB_Q02", theme: "아이스브레이킹", type: "Q", timeSec: 20, prompt: "내 별명 3~4글자!" },
    { id: "IB_Q03", theme: "아이스브레이킹", type: "Q", timeSec: 20, prompt: "지금 기분 3~4글자!" },
    { id: "IB_Q04", theme: "아이스브레이킹", type: "Q", timeSec: 20, prompt: "내 장점 3~4글자!" },
    { id: "IB_Q05", theme: "아이스브레이킹", type: "Q", timeSec: 20, prompt: "내 매력 3~4글자!" },
    { id: "IB_Q06", theme: "아이스브레이킹", type: "Q", timeSec: 20, prompt: "최애간식 3~4글자!" },
    { id: "IB_Q07", theme: "아이스브레이킹", type: "Q", timeSec: 20, prompt: "최애음료 3~4글자!" },
    { id: "IB_Q08", theme: "아이스브레이킹", type: "Q", timeSec: 20, prompt: "요즘유행 3~4글자!" },
    { id: "IB_Q09", theme: "아이스브레이킹", type: "Q", timeSec: 20, prompt: "내 취미 3~4글자!" },
    { id: "IB_Q10", theme: "아이스브레이킹", type: "Q", timeSec: 20, prompt: "오늘목표 3~4글자!" },

    // 아이스브레이킹: 선택형 20
    { id: "IB_C01", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "첫대화", A: "먼저말", B: "먼저웃" },
    { id: "IB_C02", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "소개스타", A: "한줄", B: "TMI" },
    { id: "IB_C03", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "친해짐", A: "공통", B: "드립" },
    { id: "IB_C04", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "사진타입", A: "셀카", B: "단체" },
    { id: "IB_C05", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "리액션", A: "끄덕", B: "박수" },
    { id: "IB_C06", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "메뉴픽", A: "빠른", B: "고민" },
    { id: "IB_C07", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "말스타", A: "짧게", B: "길게" },
    { id: "IB_C08", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "기분표현", A: "표정", B: "말로" },
    { id: "IB_C09", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "취미공유", A: "바로", B: "천천" },
    { id: "IB_C10", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "이모지", A: "많이", B: "적게" },
    { id: "IB_C11", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "자기PR", A: "겸손", B: "당당" },
    { id: "IB_C12", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "첫인사", A: "하이", B: "안녕" },
    { id: "IB_C13", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "자리선택", A: "중앙", B: "구석" },
    { id: "IB_C14", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "잡담", A: "일상", B: "취향" },
    { id: "IB_C15", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "속도", A: "즉답", B: "숙고" },
    { id: "IB_C16", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "다정함", A: "말로", B: "행동" },
    { id: "IB_C17", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "호칭", A: "이름", B: "님" },
    { id: "IB_C18", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "간식", A: "단것", B: "짠것" },
    { id: "IB_C19", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "대화주도", A: "질문", B: "답변" },
    { id: "IB_C20", theme: "아이스브레이킹", type: "C", timeSec: 10, prompt: "분위기", A: "차분", B: "활발" },

    // ------------------------------------------------------------
    // 소개팅·미팅: 질문형 10 (가볍고 3~4글자 답 유도)
    // ------------------------------------------------------------
    { id: "DM_Q01", theme: "소개팅·미팅", type: "Q", timeSec: 20, prompt: "호감포 3~4글자!" },
    { id: "DM_Q02", theme: "소개팅·미팅", type: "Q", timeSec: 20, prompt: "설렘포 3~4글자!" },
    { id: "DM_Q03", theme: "소개팅·미팅", type: "Q", timeSec: 20, prompt: "데이트픽 3~4글자!" },
    { id: "DM_Q04", theme: "소개팅·미팅", type: "Q", timeSec: 20, prompt: "대화톤 3~4글자!" },
    { id: "DM_Q05", theme: "소개팅·미팅", type: "Q", timeSec: 20, prompt: "연락톤 3~4글자!" },
    { id: "DM_Q06", theme: "소개팅·미팅", type: "Q", timeSec: 20, prompt: "첫멘트 3~4글자!" },
    { id: "DM_Q07", theme: "소개팅·미팅", type: "Q", timeSec: 20, prompt: "나의무드 3~4글자!" },
    { id: "DM_Q08", theme: "소개팅·미팅", type: "Q", timeSec: 20, prompt: "선물픽 3~4글자!" },
    { id: "DM_Q09", theme: "소개팅·미팅", type: "Q", timeSec: 20, prompt: "취향태그 3~4글자!" },
    { id: "DM_Q10", theme: "소개팅·미팅", type: "Q", timeSec: 20, prompt: "단점고백 3~4글자!" },

    // 소개팅·미팅: 선택형 20
    { id: "DM_C01", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "데이트", A: "카페", B: "산책" },
    { id: "DM_C02", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "대화", A: "질문", B: "공감" },
    { id: "DM_C03", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "연락", A: "짧게", B: "길게" },
    { id: "DM_C04", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "속도", A: "바로", B: "천천" },
    { id: "DM_C05", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "첫만남룩", A: "깔끔", B: "꾸안" },
    { id: "DM_C06", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "호감신호", A: "눈맞", B: "미소" },
    { id: "DM_C07", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "장소", A: "조용", B: "활기" },
    { id: "DM_C08", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "취향공유", A: "음식", B: "여행" },
    { id: "DM_C09", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "플러팅", A: "직구", B: "은근" },
    { id: "DM_C10", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "칭찬", A: "외모", B: "성격" },
    { id: "DM_C11", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "주말", A: "집콕", B: "외출" },
    { id: "DM_C12", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "콘텐츠", A: "영화", B: "드라" },
    { id: "DM_C13", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "간식", A: "달달", B: "짭짤" },
    { id: "DM_C14", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "사진", A: "잘찍", B: "안찍" },
    { id: "DM_C15", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "선호", A: "다정", B: "쿨함" },
    { id: "DM_C16", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "대화주도", A: "내가", B: "상대" },
    { id: "DM_C17", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "계획", A: "즉흥", B: "계획" },
    { id: "DM_C18", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "표현", A: "말로", B: "행동" },
    { id: "DM_C19", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "거리", A: "가까", B: "적당" },
    { id: "DM_C20", theme: "소개팅·미팅", type: "C", timeSec: 10, prompt: "마무리", A: "2차", B: "다음" },

    // ------------------------------------------------------------
    // 회식·술자리: 질문형 10
    // ------------------------------------------------------------
    { id: "DR_Q01", theme: "회식·술자리", type: "Q", timeSec: 20, prompt: "오늘안주 3~4글자!" },
    { id: "DR_Q02", theme: "회식·술자리", type: "Q", timeSec: 20, prompt: "술취향 3~4글자!" },
    { id: "DR_Q03", theme: "회식·술자리", type: "Q", timeSec: 20, prompt: "건배사 3~4글자!" },
    { id: "DR_Q04", theme: "회식·술자리", type: "Q", timeSec: 20, prompt: "내주량 3~4글자!" },
    { id: "DR_Q05", theme: "회식·술자리", type: "Q", timeSec: 20, prompt: "술버릇 3~4글자!" },
    { id: "DR_Q06", theme: "회식·술자리", type: "Q", timeSec: 20, prompt: "2차픽 3~4글자!" },
    { id: "DR_Q07", theme: "회식·술자리", type: "Q", timeSec: 20, prompt: "텐션송 3~4글자!" },
    { id: "DR_Q08", theme: "회식·술자리", type: "Q", timeSec: 20, prompt: "벌칙명 3~4글자!" },
    { id: "DR_Q09", theme: "회식·술자리", type: "Q", timeSec: 20, prompt: "웃참법 3~4글자!" },
    { id: "DR_Q10", theme: "회식·술자리", type: "Q", timeSec: 20, prompt: "오늘레전 3~4글자!" },

    // 회식·술자리: 선택형 20
    { id: "DR_C01", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "술픽", A: "소주", B: "맥주" },
    { id: "DR_C02", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "2차", A: "간다", B: "귀가" },
    { id: "DR_C03", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "안주", A: "매콤", B: "담백" },
    { id: "DR_C04", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "분위기", A: "토크", B: "게임" },
    { id: "DR_C05", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "텐션", A: "조용", B: "활발" },
    { id: "DR_C06", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "건배", A: "짧게", B: "길게" },
    { id: "DR_C07", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "벌칙", A: "노래", B: "댄스" },
    { id: "DR_C08", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "자리", A: "돌기", B: "고정" },
    { id: "DR_C09", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "속도", A: "천천", B: "원샷" },
    { id: "DR_C10", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "종류", A: "하이볼", B: "막걸" },
    { id: "DR_C11", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "안주2", A: "치킨", B: "삼겹" },
    { id: "DR_C12", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "게임", A: "눈치", B: "랜덤" },
    { id: "DR_C13", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "토크", A: "추억", B: "밈톡" },
    { id: "DR_C14", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "마무리", A: "해장", B: "디저" },
    { id: "DR_C15", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "3차", A: "간다", B: "안간" },
    { id: "DR_C16", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "주도", A: "내가", B: "상대" },
    { id: "DR_C17", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "사진", A: "남김", B: "안남" },
    { id: "DR_C18", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "귀가", A: "택시", B: "대리" },
    { id: "DR_C19", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "숙취", A: "해장국", B: "물만" },
    { id: "DR_C20", theme: "회식·술자리", type: "C", timeSec: 10, prompt: "레전드", A: "웃음", B: "감동" },

    // ------------------------------------------------------------
    // 크루모드: 질문형 10
    // ------------------------------------------------------------
    { id: "CR_Q01", theme: "크루모드", type: "Q", timeSec: 20, prompt: "우리팀별 3~4글자!" },
    { id: "CR_Q02", theme: "크루모드", type: "Q", timeSec: 20, prompt: "팀무드 3~4글자!" },
    { id: "CR_Q03", theme: "크루모드", type: "Q", timeSec: 20, prompt: "오늘MVP 3~4글자!" },
    { id: "CR_Q04", theme: "크루모드", type: "Q", timeSec: 20, prompt: "내역할 3~4글자!" },
    { id: "CR_Q05", theme: "크루모드", type: "Q", timeSec: 20, prompt: "협업팁 3~4글자!" },
    { id: "CR_Q06", theme: "크루모드", type: "Q", timeSec: 20, prompt: "업무밈 3~4글자!" },
    { id: "CR_Q07", theme: "크루모드", type: "Q", timeSec: 20, prompt: "칭찬한마 3~4글자!" },
    { id: "CR_Q08", theme: "크루모드", type: "Q", timeSec: 20, prompt: "고생포 3~4글자!" },
    { id: "CR_Q09", theme: "크루모드", type: "Q", timeSec: 20, prompt: "다음목표 3~4글자!" },
    { id: "CR_Q10", theme: "크루모드", type: "Q", timeSec: 20, prompt: "한줄회고 3~4글자!" },

    // 크루모드: 선택형 20
    { id: "CR_C01", theme: "크루모드", type: "C", timeSec: 10, prompt: "역할", A: "리더", B: "서폿" },
    { id: "CR_C02", theme: "크루모드", type: "C", timeSec: 10, prompt: "스타일", A: "계획", B: "즉흥" },
    { id: "CR_C03", theme: "크루모드", type: "C", timeSec: 10, prompt: "해결", A: "바로", B: "분석" },
    { id: "CR_C04", theme: "크루모드", type: "C", timeSec: 10, prompt: "피드백", A: "직설", B: "부드" },
    { id: "CR_C05", theme: "크루모드", type: "C", timeSec: 10, prompt: "회의", A: "짧게", B: "깊게" },
    { id: "CR_C06", theme: "크루모드", type: "C", timeSec: 10, prompt: "정리", A: "메모", B: "머리" },
    { id: "CR_C07", theme: "크루모드", type: "C", timeSec: 10, prompt: "소통", A: "텍스트", B: "통화" },
    { id: "CR_C08", theme: "크루모드", type: "C", timeSec: 10, prompt: "공유", A: "즉시", B: "나중" },
    { id: "CR_C09", theme: "크루모드", type: "C", timeSec: 10, prompt: "집중", A: "단독", B: "함께" },
    { id: "CR_C10", theme: "크루모드", type: "C", timeSec: 10, prompt: "업무", A: "속도", B: "완성" },
    { id: "CR_C11", theme: "크루모드", type: "C", timeSec: 10, prompt: "칭찬", A: "공개", B: "비공" },
    { id: "CR_C12", theme: "크루모드", type: "C", timeSec: 10, prompt: "협업", A: "주도", B: "지원" },
    { id: "CR_C13", theme: "크루모드", type: "C", timeSec: 10, prompt: "결정", A: "빠름", B: "신중" },
    { id: "CR_C14", theme: "크루모드", type: "C", timeSec: 10, prompt: "문서", A: "짧게", B: "자세" },
    { id: "CR_C15", theme: "크루모드", type: "C", timeSec: 10, prompt: "아이디어", A: "폭발", B: "정리" },
    { id: "CR_C16", theme: "크루모드", type: "C", timeSec: 10, prompt: "휴식", A: "짧게", B: "길게" },
    { id: "CR_C17", theme: "크루모드", type: "C", timeSec: 10, prompt: "마감", A: "미리", B: "직전" },
    { id: "CR_C18", theme: "크루모드", type: "C", timeSec: 10, prompt: "동기", A: "칭찬", B: "성과" },
    { id: "CR_C19", theme: "크루모드", type: "C", timeSec: 10, prompt: "분위기", A: "진지", B: "유쾌" },
    { id: "CR_C20", theme: "크루모드", type: "C", timeSec: 10, prompt: "마무리", A: "회고", B: "약속" },
];
