import React, { lazy, Suspense, useEffect, useState, ReactNode } from 'react';

const LazyMap = lazy(() => import(/* webpackPrefetch: true */ './Map'));

const Skeleton = () => (
  <div style={{ padding: 20 }}>
    <div
      style={{
        width: '100%',
        height: 360,
        background: 'linear-gradient(90deg,#eef2f8,#f8fbff)',
        borderRadius: 8,
      }}
    />
    <div style={{ marginTop: 12, color: '#666' }}>Preparing interactive map…</div>
  </div>
);

const ErrorFallback: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div style={{ padding: 20, color: '#b00020' }}>
    Failed to load the map. <button onClick={onRetry}>Retry</button>
  </div>
);

// ✅ Error boundary now accepts children properly
type BoundaryProps = {
  onRetry: () => void;
  children?: ReactNode;
};

class Boundary extends React.Component<BoundaryProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          onRetry={() => {
            this.setState({ hasError: false });
            this.props.onRetry();
          }}
        />
      );
    }
    return this.props.children;
  }
}

export default function MapWithLoader() {
  // warm up the chunk during idle too
  useEffect(() => {
    const preload = () => import('./Map').catch(() => {});
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preload, { timeout: 2000 });
    } else {
      const t = setTimeout(preload, 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const [retryKey, setRetryKey] = useState(0);

  return (
    <Boundary onRetry={() => setRetryKey((k) => k + 1)}>
      <Suspense fallback={<Skeleton />}>
        {/* changing key forces a fresh attempt after a failure */}
        <LazyMap key={retryKey} />
      </Suspense>
    </Boundary>
  );
}
