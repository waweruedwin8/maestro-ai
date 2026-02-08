import { Music, Github } from 'lucide-react';
import { MaestroChat } from '@/components/chat/MaestroChat';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background staff-pattern">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-foreground">
                Maestro AI
              </h1>
              <p className="text-xs text-muted-foreground">
                Adaptive Music Workspace
              </p>
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Github className="w-5 h-5 text-muted-foreground" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4">
        <MaestroChat />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="container px-4 text-center text-xs text-muted-foreground">
          <p>
            Built with <span className="text-primary">Tambo Generative UI</span> •{' '}
            <span className="text-musical-gold">abcjs</span> •{' '}
            <span className="text-musical-blue">Tone.js</span>
          </p>
          <p className="mt-1">The UI Strikes Back Hackathon 2026</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
