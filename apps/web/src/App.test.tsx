// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('TaskFlow', () => {
  it('rejects blank tasks and explains the validation error', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '追加する' }));
    const input = screen.getByRole('textbox', { name: '新しいタスク' });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const statusId = input.getAttribute('aria-describedby');
    expect(statusId).toBeTruthy();
    expect(document.getElementById(statusId ?? '')?.textContent).toContain(
      'タスク名を入力してください',
    );
    expect(screen.getByText('タスクはまだありません')).toBeTruthy();
  });

  it('adds and persists a task', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('新しいタスク'), { target: { value: '牛乳を買う' } });
    fireEvent.click(screen.getByRole('button', { name: '追加する' }));
    expect(screen.getByText('牛乳を買う')).toBeTruthy();
    await vi.waitFor(() =>
      expect(JSON.parse(localStorage.getItem('taskflow.tasks.v1') ?? '[]')).toHaveLength(1),
    );
  });

  it('edits a task title', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('新しいタスク'), { target: { value: '牛乳を買う' } });
    fireEvent.click(screen.getByRole('button', { name: '追加する' }));
    fireEvent.click(screen.getByRole('button', { name: '編集' }));
    fireEvent.change(screen.getByLabelText('タスク名を編集'), { target: { value: 'パンを買う' } });
    fireEvent.click(screen.getByRole('button', { name: '変更を保存' }));
    expect(screen.getByText('パンを買う')).toBeTruthy();
    expect(screen.queryByText('牛乳を買う')).toBeNull();
  });

  it('toggles a task completion state', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('新しいタスク'), { target: { value: '牛乳を買う' } });
    fireEvent.click(screen.getByRole('button', { name: '追加する' }));
    const checkbox = screen.getByRole('checkbox', { name: '牛乳を買うを完了にする' });
    fireEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText('0件の未完了')).toBeTruthy();
  });

  it('deletes only the selected task', () => {
    render(<App />);
    for (const title of ['牛乳を買う', 'パンを買う']) {
      fireEvent.change(screen.getByLabelText('新しいタスク'), { target: { value: title } });
      fireEvent.click(screen.getByRole('button', { name: '追加する' }));
    }
    fireEvent.click(screen.getByRole('button', { name: '牛乳を買うを削除' }));
    expect(screen.queryByText('牛乳を買う')).toBeNull();
    expect(screen.getByText('パンを買う')).toBeTruthy();
  });

  it('restores valid tasks and ignores malformed persisted values', () => {
    localStorage.setItem(
      'taskflow.tasks.v1',
      JSON.stringify([{ id: 'one', title: '復元したタスク', completed: false }, { id: 1 }]),
    );
    render(<App />);
    expect(screen.getByText('復元したタスク')).toBeTruthy();
    expect(screen.queryByText('undefined')).toBeNull();
  });
});
