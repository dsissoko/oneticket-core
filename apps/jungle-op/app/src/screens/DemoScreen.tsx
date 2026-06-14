import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useUsers } from '@/hooks/useUsers';
import { useEventSource } from '@/hooks/useEventSource';
import { useCreateUser } from '@/hooks/useCreateUser';
import { useUpdateUser } from '@/hooks/useUpdateUser';
import { useDeleteUser } from '@/hooks/useDeleteUser';
import { useTheme } from 'next-themes';
import { logger } from '@/lib/logger';
import { createUserSchema, type CreateUserFormData } from '@/lib/schemas/user';
import type { User } from '@/api/types';

// ─── Types ──────────────────────────────────────────────────────────────────

type FormMode = 'idle' | 'create' | 'edit';

const PAGE_SIZE = 3;

// ─── UserForm ───────────────────────────────────────────────────────────────

interface UserFormProps {
  mode: 'create' | 'edit';
  user?: User;
  onCancel: () => void;
  onSave: () => void;
}

function UserForm({ mode, user, onCancel, onSave }: UserFormProps) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      role: user?.role ?? 'user',
    },
  });

  const onSubmit = (data: CreateUserFormData) => {
    if (mode === 'create') {
      createUser.mutate(data, { onSuccess: onSave });
    } else if (user) {
      updateUser.mutate({ id: user.id, data }, { onSuccess: onSave });
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">
          {mode === 'create' ? '+ New User' : '✏️ Edit User'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Input placeholder="Name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Input placeholder="Email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Select
              defaultValue={user?.role ?? 'user'}
              onValueChange={(val) => setValue('role', val as 'admin' | 'user')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="default">Save</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── UserList ────────────────────────────────────────────────────────────────

interface UserListProps {
  onEdit: (user: User) => void;
  onNew: () => void;
  formMode: FormMode;
}

function UserList({ onEdit, onNew, formMode }: UserListProps) {
  const { data: users, isLoading, isError } = useUsers();
  const deleteUser = useDeleteUser();
  const [page, setPage] = useState(1);

  const allUsers = users ?? [];
  const totalPages = Math.max(1, Math.ceil(allUsers.length / PAGE_SIZE));
  const pageUsers = allUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading users...</p>;
  if (isError) return <p className="text-destructive text-sm">Failed to load users.</p>;

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{allUsers.length} users</p>
        <Button variant="default" size="sm" onClick={onNew} disabled={formMode !== 'idle'}>
          + New User
        </Button>
      </div>

      {/* List */}
      <div className="divide-y divide-border rounded-lg border">
        {pageUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                user.role === 'admin'
                  ? 'border-primary text-primary'
                  : 'border-border text-muted-foreground'
              }`}>
                {user.role}
              </span>
              <Button variant="outline" size="sm" onClick={() => onEdit(user)} disabled={formMode !== 'idle'}>
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteUser.mutate(user.id)}
                disabled={formMode !== 'idle'}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            ←
          </Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            →
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── LoggerTab ───────────────────────────────────────────────────────────────

function LoggerTab() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Open your browser DevTools console (F12) then click the buttons below.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button variant="outline" onClick={() => logger.debug('[demo] debug message')}>Debug</Button>
        <Button variant="outline" onClick={() => logger.info('[demo] info message')}>Info</Button>
        <Button variant="outline" onClick={() => logger.warn('[demo] warn message')}>Warn</Button>
        <Button variant="outline" onClick={() => logger.error('[demo] error message')}>Error</Button>
      </div>
      <Separator />
      <p className="text-xs text-muted-foreground">
        Log level: <code className="bg-muted px-1 rounded">{import.meta.env.VITE_LOG_LEVEL || 'debug (default)'}</code>
      </p>
    </div>
  );
}

// ─── ThemeTab ────────────────────────────────────────────────────────────────

const TOKEN_GROUPS = [
  { label: 'Background', var: '--background' },
  { label: 'Foreground', var: '--foreground' },
  { label: 'Primary', var: '--primary' },
  { label: 'Secondary', var: '--secondary' },
  { label: 'Muted', var: '--muted' },
  { label: 'Accent', var: '--accent' },
  { label: 'Destructive', var: '--destructive' },
  { label: 'Border', var: '--border' },
  { label: 'Card', var: '--card' },
  { label: 'Popover', var: '--popover' },
  { label: 'Input', var: '--input' },
  { label: 'Ring', var: '--ring' },
];

function ThemeTab() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Switcher */}
      <div className="flex gap-2">
        {(['system', 'light', 'dark'] as const).map((t) => (
          <Button
            key={t}
            variant={theme === t ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>
      <Separator />
      {/* Token swatches */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {TOKEN_GROUPS.map(({ label, var: cssVar }) => (
          <div key={cssVar} className="space-y-1">
            <div
              className="h-10 rounded-md border border-border"
              style={{ background: `hsl(var(${cssVar}))` }}
            />
            <p className="text-xs text-muted-foreground text-center">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RealtimeTab ─────────────────────────────────────────────────────────────

const SPEED_OPTIONS = [
  { label: '100ms', value: 100 },
  { label: '250ms', value: 250 },
  { label: '500ms', value: 500 },
  { label: '1s', value: 1000 },
  { label: '2s', value: 2000 },
];

const TOTAL_STEPS = 300; // 5 minutes at 1s/step

function RealtimeTab() {
  const [interval, setIntervalMs] = useState(1000);
  const url = `/api/stream?steps=${TOTAL_STEPS}&interval=${interval}`;
  const { events, status, start, stop, reset } = useEventSource(url, ['progress', 'done']);

  const progressEvent = events.find(e => e.type === 'progress');
  const doneEvent = events.find(e => e.type === 'done');
  const pct = progressEvent ? (JSON.parse(progressEvent.data) as { pct: number }).pct : 0;
  const currentStep = progressEvent ? (JSON.parse(progressEvent.data) as { step: number }).step : 0;
  const isRunning = status === 'open' || status === 'connecting';
  const isDone = status === 'closed' && doneEvent !== undefined;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="default" size="sm" onClick={start} disabled={isRunning}>
          ▶ Start
        </Button>
        <Button variant="outline" size="sm" onClick={stop} disabled={!isRunning}>
          ■ Stop
        </Button>
        <Button variant="ghost" size="sm" onClick={reset} disabled={isRunning}>
          ↺ Reset
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">Speed:</span>
          <Select
            value={String(interval)}
            onValueChange={v => setIntervalMs(Number(v))}
          >
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPEED_OPTIONS.map(o => (
                <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {isDone
              ? `✓ Done — ${(JSON.parse(doneEvent!.data) as { duration: string }).duration}`
              : isRunning
              ? `Step ${currentStep} / ${TOTAL_STEPS}`
              : status === 'idle' ? 'Ready' : `Step ${currentStep} / ${TOTAL_STEPS}`}
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-200"
            style={{ width: `${isDone ? 100 : pct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground italic">simulated via MSW · {TOTAL_STEPS} steps · configurable speed</p>
      </div>

      <Separator />

      {/* Live event log */}
      {events.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {events.slice(0, 20).map((e, i) => {
            const d = JSON.parse(e.data) as Record<string, unknown>;
            return (
              <p key={i} className="text-xs text-muted-foreground font-mono">
                {e.type === 'done'
                  ? `✓ done in ${d.duration as string}`
                  : `→ ${d.message as string}`}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── AuthTab ─────────────────────────────────────────────────────────────────

function AuthTab() {
  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <p className="text-sm text-foreground font-medium">Auth0 integration — coming in epic-1-auth0</p>
        <p className="text-sm text-muted-foreground">
          This tab will demonstrate login/logout with Auth0, protected routes, and the <code className="bg-muted px-1 rounded">useAuth()</code> hook.
        </p>
        <a
          href="https://dsissoko.github.io/oneticket-core/appshell/docs/what/epics/epic-1-auth0/epic/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-primary hover:underline"
        >
          View epic-1-auth0 →
        </a>
      </CardContent>
    </Card>
  );
}

// ─── DemoScreen ──────────────────────────────────────────────────────────────

export function DemoScreen(): React.ReactElement {
  const [formMode, setFormMode] = useState<FormMode>('idle');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleNew    = () => { setSelectedUser(null); setFormMode('create'); };
  const handleEdit   = (user: User) => { setSelectedUser(user); setFormMode('edit'); };
  const handleCancel = () => { setSelectedUser(null); setFormMode('idle'); };
  const handleSave   = () => { setSelectedUser(null); setFormMode('idle'); };

  return (
    <div className="flex-grow bg-background text-foreground py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Patterns Demo</h1>
        <p className="text-muted-foreground mb-8">Interactive showcase of AppShell patterns.</p>

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="logger">Logger</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="realtime">Realtime</TabsTrigger>
            <TabsTrigger value="auth">Auth</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserList onEdit={handleEdit} onNew={handleNew} formMode={formMode} />
            {formMode !== 'idle' && (
              <UserForm
                mode={formMode}
                user={selectedUser ?? undefined}
                onCancel={handleCancel}
                onSave={handleSave}
              />
            )}
          </TabsContent>

          <TabsContent value="logger">
            <LoggerTab />
          </TabsContent>

          <TabsContent value="theme">
            <ThemeTab />
          </TabsContent>

          <TabsContent value="realtime">
            <RealtimeTab />
          </TabsContent>

          <TabsContent value="auth">
            <AuthTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default DemoScreen;
