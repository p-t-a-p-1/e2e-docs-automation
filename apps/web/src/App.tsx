import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Icon } from '@astryxdesign/core/Icon';
import { StackItem } from '@astryxdesign/core/Stack';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Theme } from '@astryxdesign/core/theme';
import { VStack } from '@astryxdesign/core/VStack';
import { defaultThemeSlug, themes } from './astryx-themes';

type Task = { id: string; title: string; completed: boolean };
const STORAGE_KEY = 'taskflow.tasks.v1';

type FieldStatus = { type: 'error'; message: string } | undefined;

function readTasks(): Task[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    return value.filter(
      (task): task is Task =>
        typeof task?.id === 'string' &&
        typeof task?.title === 'string' &&
        typeof task?.completed === 'boolean',
    );
  } catch {
    return [];
  }
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(readTasks);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const remaining = useMemo(() => tasks.filter((task) => !task.completed).length, [tasks]);
  const completed = tasks.length - remaining;
  const addStatus: FieldStatus =
    errorField === 'new-task' && error ? { type: 'error', message: error } : undefined;

  function addTask(event: React.FormEvent<HTMLElement>) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) {
      setError('タスク名を入力してください。');
      setErrorField('new-task');
      return;
    }
    setTasks((current) => [...current, { id: crypto.randomUUID(), title, completed: false }]);
    setDraft('');
    setError('');
    setErrorField(null);
  }

  function saveEdit(id: string) {
    const title = editDraft.trim();
    if (!title) {
      setError('タスク名を入力してください。');
      setErrorField(id);
      return;
    }
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, title } : task)));
    setEditingId(null);
    setError('');
    setErrorField(null);
  }

  return (
    <Theme theme={themes[defaultThemeSlug]} mode="system">
      <VStack className="app-shell" as="main" gap={0}>
        <HStack
          className="app-header"
          as="header"
          width="100%"
          maxWidth={1080}
          gap={4}
          hAlign="between"
          vAlign="center"
        >
          <HStack className="brand" gap={2} vAlign="center">
            <Icon icon="checkDouble" color="accent" size="lg" />
            <VStack gap={0}>
              <Text weight="semibold">TaskFlow</Text>
              <Text type="supporting">E2E Living Docs</Text>
            </VStack>
          </HStack>
          <HStack className="save-status" gap={2} vAlign="center">
            <StatusDot variant="success" label="ブラウザに自動保存されています" />
            <Text type="supporting">自動保存</Text>
          </HStack>
        </HStack>

        <VStack className="workspace" as="section" width="100%" maxWidth={720} gap={8}>
          <VStack className="page-intro" maxWidth={640} gap={2}>
            <Text type="label" color="accent">
              今日のフォーカス
            </Text>
            <Heading level={1}>今日のタスク</Heading>
            <Text type="large" color="secondary">
              やることを、ひとつずつ。小さく進めて、気持ちよく終える。
            </Text>
          </VStack>

          <VStack className="task-section" as="section" gap={4} aria-labelledby="task-list-title">
            <HStack className="section-heading" gap={4} hAlign="between" vAlign="center">
              <VStack gap={1}>
                <Heading id="task-list-title" level={2}>
                  タスク一覧
                </Heading>
                <Text type="supporting">思いついたことを、ここに追加できます。</Text>
              </VStack>
              <HStack className="task-summary" gap={2} vAlign="center">
                <Badge
                  variant={remaining === 0 ? 'success' : 'info'}
                  label={`${remaining}件の未完了`}
                />
                <Text type="supporting">{completed}件完了</Text>
              </HStack>
            </HStack>

            <HStack className="task-form" as="form" gap={3} vAlign="end" onSubmit={addTask}>
              <StackItem size="fill">
                <TextInput
                  label="新しいタスク"
                  isLabelHidden
                  value={draft}
                  onChange={setDraft}
                  placeholder="例：牛乳を買う"
                  size="lg"
                  status={addStatus}
                  statusVariant="detached"
                  enterKeyHint="done"
                />
              </StackItem>
              <Button label="追加する" type="submit" variant="primary" size="lg" />
            </HStack>

            {tasks.length === 0 ? (
              <VStack className="empty-state" role="status" gap={2}>
                <EmptyState
                  icon={<Icon icon="check" color="accent" size="lg" />}
                  title="タスクはまだありません"
                  description="上のフォームから、今日やることを追加できます。"
                  headingLevel={3}
                  isCompact
                />
              </VStack>
            ) : (
              <VStack className="task-list" as="ul" gap={0}>
                {tasks.map((task) => {
                  const editStatus: FieldStatus =
                    errorField === task.id && error ? { type: 'error', message: error } : undefined;

                  return (
                    <HStack
                      className={task.completed ? 'task-row task-row--completed' : 'task-row'}
                      as="li"
                      gap={3}
                      vAlign="center"
                      key={task.id}
                    >
                      <CheckboxInput
                        label={`${task.title}を完了にする`}
                        isLabelHidden
                        value={task.completed}
                        onChange={(checked) =>
                          setTasks((current) =>
                            current.map((item) =>
                              item.id === task.id ? { ...item, completed: checked } : item,
                            ),
                          )
                        }
                      />
                      {editingId === task.id ? (
                        <HStack
                          className="edit-form"
                          as="form"
                          gap={2}
                          vAlign="end"
                          onSubmit={(event) => {
                            event.preventDefault();
                            saveEdit(task.id);
                          }}
                        >
                          <StackItem size="fill">
                            <TextInput
                              label="タスク名を編集"
                              isLabelHidden
                              hasAutoFocus
                              value={editDraft}
                              onChange={setEditDraft}
                              status={editStatus}
                              statusVariant="detached"
                            />
                          </StackItem>
                          <Button label="変更を保存" type="submit" variant="primary" size="sm" />
                          <Button
                            label="取消"
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingId(null);
                              setError('');
                              setErrorField(null);
                            }}
                          />
                        </HStack>
                      ) : (
                        <>
                          <StackItem size="fill">
                            <Text
                              className="task-title"
                              as="span"
                              hasStrikethrough={task.completed}
                              color={task.completed ? 'secondary' : 'primary'}
                            >
                              {task.title}
                            </Text>
                          </StackItem>
                          <HStack className="task-actions" gap={1} vAlign="center">
                            <Button
                              label="編集"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingId(task.id);
                                setEditDraft(task.title);
                                setError('');
                                setErrorField(null);
                              }}
                            />
                            <Button
                              label="削除"
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setTasks((current) => current.filter((item) => item.id !== task.id))
                              }
                              aria-label={`${task.title}を削除`}
                            />
                          </HStack>
                        </>
                      )}
                    </HStack>
                  );
                })}
              </VStack>
            )}
          </VStack>
        </VStack>
      </VStack>
    </Theme>
  );
}
