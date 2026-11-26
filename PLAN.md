# TodoList 웹앱 구현 계획 (PLAN.md)

## 1. 개요 및 목표
- DESIGN.md와 요구사항을 100% 준수하는 완성도 높은 한국어 TodoList 웹앱 구현
- React, TypeScript, Vite, CSS Custom Properties(디자인 토큰 기반) 사용
- Vitest + React Testing Library 단위/통합 테스트
- 실제 브라우저(360px 모바일, 768px 태블릿, 1440px 데스크톱) 반응형 및 접근성 검증

## 2. 데이터 구조 및 모델
- 저장 키: `todo-app:v1`
- 스키마 버전: `1`
```typescript
export interface TodoItem {
  id: string; // crypto.randomUUID()
  text: string;
  completed: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface TodoStorageData {
  schemaVersion: number;
  tasks: TodoItem[];
}
```

## 3. 디렉토리 구조
```
todo-list/
├── src/
│   ├── components/
│   │   ├── Header.tsx           # 날짜, 제목, 진행률 바, 통계
│   │   ├── TodoInput.tsx        # 할 일 추가 폼, 글자 수 제한, IME 처리
│   │   ├── FilterSearch.tsx     # 전체/진행중/완료 필터 + 검색바
│   │   ├── TodoList.tsx         # 할 일 목록 및 빈 상태 처리
│   │   ├── TodoListItem.tsx     # 개별 할 일 (체크, 수정 모드, 삭제 버튼)
│   │   ├── BottomSummary.tsx    # 남은 할 일 수, 완료 항목 일괄 삭제 버튼
│   │   ├── ConfirmDialog.tsx    # 일괄 삭제 확인 모달 (<dialog>)
│   │   ├── Toast.tsx            # 실행 취소 토스트 알림
│   │   └── NoticeBanner.tsx     # 현재 필터로 인해 새 항목이 안 보일 때 안내
│   ├── hooks/
│   │   └── useTodos.ts          # 할 일 상태 및 로컬 스토리지 동기화 훅
│   ├── lib/
│   │   ├── storage.ts           # localStorage 유효성 검증 및 입출력
│   │   └── date.ts              # 로컬 한국어 날짜 포맷팅 유틸
│   ├── styles/
│   │   ├── tokens.css           # DESIGN.md에 정의된 CSS Custom Properties
│   │   └── global.css           # 기본 리셋 및 글로벌 스타일
│   ├── types/
│   │   └── todo.ts              # Todo, Filter, 상태 타입 정의
│   ├── App.tsx                  # 메인 레이아웃 및 상태 연동
│   └── main.tsx                 # 엔트리 포인트
├── tests/
│   ├── storage.test.ts          # 스토리지 유효성 검증 테스트
│   ├── TodoApp.test.tsx         # 추가, 수정, 삭제, 실행 취소, 필터, 검색 등 기능 테스트
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## 4. 단계별 실행 계획
1. **프로젝트 환경 셋업**: Vite + React + TypeScript 초기화 및 필수 패키지 설치
2. **스타일 및 디자인 토큰 구축**: `tokens.css` 적용 (DESIGN.md 명세 준수)
3. **핵심 로직 구현**: `storage.ts`, `useTodos.ts`
4. **컴포넌트 구현**:
   - `Header`: 한국어 날짜, 진행률, 접근성 게이지
   - `TodoInput`: 공백 방지, 200자 제한, 한글 IME Enter 방지, 포커스 유지
   - `TodoListItem`: 체크 토글, 인라인 편집(Enter/Esc/포커스 복귀), 개별 삭제(포커스 이동)
   - `FilterSearch`: aria-pressed 기반 필터 버튼, 검색어 초기화
   - `ConfirmDialog`: <dialog> 요소 기반, Esc 닫기, 포커스 트랩
   - `Toast`: 삭제 실행 취소 알림, 위치 복원
5. **테스트 작성 및 실행**: Vitest + Testing Library 테스트 스위트 작성 및 100% 통과 확인
6. **빌드 및 린트 검증**: `npm run build`
7. **브라우저 검증**: 로컬 개발 서버 구동 후 내장 브라우저로 360px, 768px, 1440px 화면 및 시각적/기능적 일치성 검증
8. **README.md 및 최종 보고서 작성**
