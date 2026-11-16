export type Scenario = {
  id: string;
  slug: string;
  title: string;
  description: string;
  preconditions: string[];
  steps: Array<{ id: string; goal: string; instruction: string; screenshotLabel: string }>;
  expectedResult: string;
};

export const scenarios: Scenario[] = [
  {
    id: 'TC-001',
    slug: 'task-create',
    title: 'タスクを追加する',
    description: '新しいタスクを一覧に登録します。',
    preconditions: ['TaskFlowを開いている', 'タスク一覧が空である'],
    steps: [
      {
        id: 'TC-001-S01',
        goal: '「牛乳を買う」を新しいタスクとして追加する',
        instruction: '新しいタスク欄に「牛乳を買う」と入力し、「追加する」を押します。',
        screenshotLabel: 'タスク追加後',
      },
    ],
    expectedResult: '「牛乳を買う」が未完了のタスクとして一覧に表示される。',
  },
  {
    id: 'TC-002',
    slug: 'task-edit',
    title: 'タスクを編集する',
    description: '既存タスクの名前を変更します。',
    preconditions: ['「牛乳を買う」が一覧にある'],
    steps: [
      {
        id: 'TC-002-S01',
        goal: '「牛乳を買う」を「牛乳とパンを買う」に変更する',
        instruction: '対象タスクの「編集」を押し、名前を変更して「保存」を押します。',
        screenshotLabel: 'タスク編集後',
      },
    ],
    expectedResult: 'タスク名が「牛乳とパンを買う」に更新される。',
  },
  {
    id: 'TC-003',
    slug: 'task-complete',
    title: 'タスクを完了にする',
    description: 'タスクの完了状態を切り替えます。',
    preconditions: ['未完了タスクが一覧にある'],
    steps: [
      {
        id: 'TC-003-S01',
        goal: '「牛乳とパンを買う」を完了にする',
        instruction: '対象タスク名の横にあるチェックボックスを選びます。',
        screenshotLabel: 'タスク完了後',
      },
    ],
    expectedResult: 'チェックボックスが選択され、未完了件数が減る。',
  },
  {
    id: 'TC-004',
    slug: 'task-delete',
    title: 'タスクを削除する',
    description: '不要なタスクを一覧から削除します。',
    preconditions: ['タスクが一覧にある'],
    steps: [
      {
        id: 'TC-004-S01',
        goal: '「牛乳とパンを買う」を削除する',
        instruction: '対象タスクの「削除」を押します。',
        screenshotLabel: 'タスク削除後',
      },
    ],
    expectedResult: '対象タスクが一覧から消える。',
  },
  {
    id: 'TC-005',
    slug: 'task-persistence',
    title: '再読み込み後にタスクを確認する',
    description: '保存したタスクが再読み込み後も残ることを確認します。',
    preconditions: ['「牛乳を買う」が保存されている'],
    steps: [
      {
        id: 'TC-005-S01',
        goal: 'ページを再読み込みし「牛乳を買う」が残っていることを確認する',
        instruction: 'ブラウザーを再読み込みしてタスク一覧を確認します。',
        screenshotLabel: '再読み込み後',
      },
    ],
    expectedResult: '再読み込み後も「牛乳を買う」が一覧に表示される。',
  },
  {
    id: 'TC-006',
    slug: 'task-empty-validation',
    title: '空のタスク名を拒否する',
    description: '空白だけのタスクを追加できないことを確認します。',
    preconditions: ['TaskFlowを開いている'],
    steps: [
      {
        id: 'TC-006-S01',
        goal: 'タスク名を空のまま追加し、入力エラーが表示されタスクが増えないことを確認する',
        instruction: 'タスク名を入力せず「追加する」を押します。',
        screenshotLabel: '入力エラー表示',
      },
    ],
    expectedResult: 'タスクは追加されず、入力を促すエラーが表示される。',
  },
];
