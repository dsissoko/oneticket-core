import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background text-foreground">
        {/* Header will be implemented in task M */}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-background text-foreground">
        {/* Footer will be implemented in task N */}
      </footer>
    </div>
  );
}
