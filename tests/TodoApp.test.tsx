import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

// jsdom HTMLDialogElement mock
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
  localStorage.clear();
});

describe('TodoApp 통합 컴포넌트 테스트', () => {
  it('초기 화면에 제목, 날짜, 빈 상태 안내, 0% 진행률이 렌더링된다', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: '나의 할 일' })).toBeInTheDocument();
    expect(screen.getByText('아직 할 일이 없어요')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '오늘의 할 일 진행률' })).toHaveAttribute(
      'aria-valuenow',
      '0'
    );
  });

  it('새 할 일을 추가하고 공백 입력 및 글자 수를 제한한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    const addButton = screen.getByRole('button', { name: '할 일 추가' });

    // 1. 공백만 입력 후 추가 시 오류 표시
    await user.type(input, '   ');
    await user.click(addButton);
    expect(screen.getByText('할 일을 입력해 주세요.')).toBeInTheDocument();

    // 2. 정상 할 일 입력
    await user.clear(input);
    await user.type(input, '디자인 시스템 점검하기');
    await user.click(addButton);

    // 목록에 항목 생성 확인
    expect(screen.getByText('디자인 시스템 점검하기')).toBeInTheDocument();
    // 입력창이 초기화되고 포커스를 유지하는지 확인
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();

    // 통계 업데이트 확인 (0 / 1 완료)
    expect(screen.getByText('0 / 1 완료')).toBeInTheDocument();
    expect(screen.getByText(/남은 할 일/)).toBeInTheDocument();
  });

  it('한글 IME 조합 중 Enter 키 입력 시 중복 등록되지 않는다', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');

    fireEvent.change(input, { target: { value: '한글입력테스트' } });

    // isComposing: true 인 상태에서 Enter 발생
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true, nativeEvent: { isComposing: true } });

    // 등록되지 않고 입력창에 여전히 남아있어야 함
    expect(screen.queryByText('한글입력테스트')).not.toBeInTheDocument();
    expect(input).toHaveValue('한글입력테스트');

    // 조합 완료 후 Enter 발생
    fireEvent.keyDown(input, { key: 'Enter', nativeEvent: { isComposing: false } });
    expect(screen.getByText('한글입력테스트')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('체크박스로 완료/미완료 상태를 전환하고 진행률이 100%로 변경된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '청소하기{enter}');

    const checkbox = screen.getByRole('checkbox', { name: '청소하기 완료 여부' });
    expect(checkbox).not.toBeChecked();

    // 완료 체크
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('1 / 1 완료')).toBeInTheDocument();

    // 다시 미완료 체크
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('할 일 내용을 수정하고 저장하거나 취소할 수 있다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '운동하기{enter}');

    // 수정 버튼 클릭
    const editButton = screen.getByRole('button', { name: '"운동하기" 수정' });
    await user.click(editButton);

    const editInput = screen.getByLabelText('할 일 수정');
    expect(editInput).toHaveValue('운동하기');

    // Esc로 취소
    await user.type(editInput, ' 수정중');
    await user.keyboard('{Escape}');
    expect(screen.getByText('운동하기')).toBeInTheDocument();
    expect(screen.queryByLabelText('할 일 수정')).not.toBeInTheDocument();

    // 다시 수정 진입 후 Enter로 저장
    await user.click(screen.getByRole('button', { name: '"운동하기" 수정' }));
    const editInput2 = screen.getByLabelText('할 일 수정');
    await user.clear(editInput2);
    await user.type(editInput2, '달리기 5km{enter}');

    expect(screen.getByText('달리기 5km')).toBeInTheDocument();
  });

  it('개별 삭제 후 실행 취소 알림이 뜨고, 실행 취소 클릭 시 원래 위치로 복원된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '첫 번째{enter}');
    await user.type(input, '두 번째{enter}');

    // 목록 확인 ('두 번째', '첫 번째' 순)
    expect(screen.getByText('두 번째')).toBeInTheDocument();
    expect(screen.getByText('첫 번째')).toBeInTheDocument();

    // 두 번째 삭제
    const deleteBtn = screen.getByRole('button', { name: '"두 번째" 삭제' });
    await user.click(deleteBtn);

    // 실행 취소 토스트 노출 확인
    expect(screen.getByText('할 일을 삭제했어요.')).toBeInTheDocument();
    expect(screen.queryByText('두 번째')).not.toBeInTheDocument();

    // 실행 취소 클릭
    const undoButton = screen.getByRole('button', { name: '삭제한 할 일 실행 취소' });
    await user.click(undoButton);

    // 두 번째 항목이 맨 위(원래 위치)로 복원되었는지 확인
    expect(screen.getByText('두 번째')).toBeInTheDocument();
  });

  it('연속 삭제 시 최신 삭제 1건만 실행 취소 대상이 된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '항목 A{enter}');
    await user.type(input, '항목 B{enter}');
    await user.type(input, '항목 C{enter}');

    // 항목 C 삭제 후 바로 항목 B 삭제
    await user.click(screen.getByRole('button', { name: '"항목 C" 삭제' }));
    await user.click(screen.getByRole('button', { name: '"항목 B" 삭제' }));

    // 실행 취소 클릭
    const undoButton = screen.getByRole('button', { name: '삭제한 할 일 실행 취소' });
    await user.click(undoButton);

    // 항목 B만 복원되고 항목 C는 삭제된 상태 유지
    expect(screen.getByText('항목 B')).toBeInTheDocument();
    expect(screen.queryByText('항목 C')).not.toBeInTheDocument();
  });

  it('상태 필터와 검색을 함께 적용하여 교집합으로 필터링한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, 'React 공부하기{enter}');
    await user.type(input, 'TypeScript 복습하기{enter}');

    // 'React 공부하기' 완료 처리
    const reactCheckbox = screen.getByRole('checkbox', { name: 'React 공부하기 완료 여부' });
    await user.click(reactCheckbox);

    // 1. '진행 중' 필터 클릭
    const activeFilterBtn = screen.getByRole('button', { name: '진행 중' });
    await user.click(activeFilterBtn);
    expect(screen.getByText('TypeScript 복습하기')).toBeInTheDocument();
    expect(screen.queryByText('React 공부하기')).not.toBeInTheDocument();

    // 2. 검색어 '공부' 입력 (진행 중인 것 중 '공부'는 없음)
    const searchInput = screen.getByPlaceholderText('할 일 검색');
    await user.type(searchInput, '공부');

    // 검색 결과 없음 상태 확인
    expect(screen.getByText('일치하는 할 일이 없어요')).toBeInTheDocument();

    // 3. 검색어 초기화 클릭
    const clearSearchBtn = screen.getByRole('button', { name: '검색어 초기화' });
    await user.click(clearSearchBtn);
    expect(screen.getByText('TypeScript 복습하기')).toBeInTheDocument();

    // 4. '완료' 필터 클릭
    const completedFilterBtn = screen.getByRole('button', { name: '완료' });
    await user.click(completedFilterBtn);
    expect(screen.getByText('React 공부하기')).toBeInTheDocument();
    expect(screen.queryByText('TypeScript 복습하기')).not.toBeInTheDocument();
  });

  it('완료 항목 일괄 삭제 버튼 클릭 시 확인 대화상자가 뜨고 확인 시 삭제된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '할 일 1{enter}');
    await user.type(input, '할 일 2{enter}');

    const clearButton = screen.getByRole('button', { name: /완료한 할 일 0개 일괄 삭제/ });
    expect(clearButton).toBeDisabled();

    // 할 일 1 완료
    await user.click(screen.getByRole('checkbox', { name: '할 일 1 완료 여부' }));
    expect(clearButton).toBeEnabled();

    // 일괄 삭제 클릭 -> 대화상자 노출
    await user.click(clearButton);
    expect(screen.getByText('완료한 할 일을 삭제할까요?')).toBeInTheDocument();
    expect(screen.getByText(/이 작업은 되돌릴 수 없습니다/)).toBeInTheDocument();

    // 취소 클릭 시 유지
    const cancelBtn = screen.getByRole('button', { name: '취소' });
    await user.click(cancelBtn);
    expect(screen.getByText('할 일 1')).toBeInTheDocument();

    // 다시 열고 확인 클릭 시 일괄 삭제
    await user.click(clearButton);
    const confirmDeleteBtn = screen.getByRole('button', { name: '1개 삭제' });
    await user.click(confirmDeleteBtn);

    expect(screen.queryByText('할 일 1')).not.toBeInTheDocument();
    expect(screen.getByText('할 일 2')).toBeInTheDocument();
  });

  it('새로고침(컴포넌트 재마운트) 후 localStorage에 저장된 데이터가 복원된다', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '새로고침 복원 테스트{enter}');
    expect(screen.getByText('새로고침 복원 테스트')).toBeInTheDocument();

    // 컴포넌트 언마운트 (새로고침 시뮬레이션)
    unmount();

    // 다시 마운트
    render(<App />);
    expect(screen.getByText('새로고침 복원 테스트')).toBeInTheDocument();
  });

  it('현재 필터로 인해 새 할 일이 숨겨지면 안내 배너가 뜨고 "전체 보기"를 클릭하면 필터가 초기화된다', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. '완료' 필터 선택
    await user.click(screen.getByRole('button', { name: '완료' }));

    // 2. 새 할 일 추가 (기본 완료되지 않은 상태)
    const input = screen.getByPlaceholderText('어떤 일을 할 예정인가요?');
    await user.type(input, '숨겨진 새 할 일{enter}');

    // 안내 배너 확인
    expect(screen.getByText('할 일을 추가했어요. 현재 조건에서는 보이지 않습니다.')).toBeInTheDocument();

    // '전체 보기' 클릭
    const viewAllBtn = screen.getByRole('button', { name: '전체 보기' });
    await user.click(viewAllBtn);

    // 전체 필터로 복귀하여 새 할 일이 보임
    expect(screen.getByText('숨겨진 새 할 일')).toBeInTheDocument();
    expect(screen.queryByText('할 일을 추가했어요. 현재 조건에서는 보이지 않습니다.')).not.toBeInTheDocument();
  });
});
