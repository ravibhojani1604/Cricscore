import { Swords } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md border-b border-border">
      <div className="container mx-auto flex items-center gap-3">
        <Swords className="h-8 w-8" />
        <h1 className="text-2xl font-bold tracking-tight">
          Cricket Companion
        </h1>
      </div>
    </header>
  );
}
