import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (import.meta.env.DEV) console.error('TrollFaces crashed:', error);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="font-display text-7xl uppercase leading-none tracking-tight text-ink">
          Oof
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-fg">
          Front-page error
        </p>
        <p className="text-sm text-muted-fg">
          The press jammed. Reload to keep playing.
        </p>
        <button
          type="button"
          onClick={() => {
            this.reset();
            location.reload();
          }}
          className="border-2 border-ink bg-paper px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-ink shadow-stamp transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-stamp-pressed"
        >
          Reload
        </button>
      </div>
    );
  }
}
