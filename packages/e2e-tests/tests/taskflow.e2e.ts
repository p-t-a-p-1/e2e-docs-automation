import { describe, test } from '@e2e-dev/web';
import { expect } from 'e2e';

describe('TaskFlow', () => {
  test('[TC-001] タスクを追加する', async ({ app, agent, screen }) => {
    await app.open('/');
    await app.clearState();
    await agent.act('新しいタスク欄に「牛乳を買う」と入力して、追加するボタンを押す');
    await expect(screen.getByText('牛乳を買う')).toBeVisible();
    await app.screenshot('TC-001-task-created');
  });

  test('[TC-002] タスクを編集する', async ({ app, agent, screen }) => {
    await app.open('/');
    await app.clearState();
    await agent.act('新しいタスクとして「牛乳を買う」を追加する');
    await expect(screen.getByText('牛乳を買う')).toBeVisible();
    await agent.act('「牛乳を買う」の編集を押して、名前を「牛乳とパンを買う」に変えて保存する');
    await expect(screen.getByText('牛乳とパンを買う')).toBeVisible();
    await app.screenshot('TC-002-task-edited');
  });

  test('[TC-003] タスクを完了にする', async ({ app, agent, screen }) => {
    await app.open('/');
    await app.clearState();
    await agent.act('「牛乳を買う」というタスクを追加する');
    await expect(screen.getByText('牛乳を買う')).toBeVisible();
    await agent.act('「牛乳を買う」の横のチェックボックスを選択する');
    await expect(screen.getByRole('checkbox', { name: '牛乳を買うを完了にする' })).toBeChecked();
    await app.screenshot('TC-003-task-completed');
  });

  test('[TC-004] タスクを削除する', async ({ app, agent, screen }) => {
    await app.open('/');
    await app.clearState();
    await agent.act('「牛乳を買う」というタスクを追加する');
    await expect(screen.getByText('牛乳を買う')).toBeVisible();
    await agent.act('「牛乳を買う」の削除ボタンを押す');
    await expect(screen.getByText('牛乳を買う')).toBeHidden();
    await app.screenshot('TC-004-task-deleted');
  });

  test('[TC-005] 再読み込み後もタスクが残る', async ({ app, agent, screen, browser }) => {
    await app.open('/');
    await app.clearState();
    await agent.act('「牛乳を買う」というタスクを追加する');
    await expect(screen.getByText('牛乳を買う')).toBeVisible();
    await browser.reload();
    await expect(screen.getByText('牛乳を買う')).toBeVisible();
    await app.screenshot('TC-005-task-restored');
  });

  test('[TC-006] 空白だけのタスクは追加できない', async ({ app, agent, screen }) => {
    await app.open('/');
    await app.clearState();
    await agent.act('新しいタスク欄に空白だけを入力して、追加するを押す');
    await expect(screen.getByRole('alert')).toContainText('タスク名を入力してください');
    await expect(screen.getByRole('status')).toContainText('タスクはまだありません');
    await app.screenshot('TC-006-validation-error');
  });
});
