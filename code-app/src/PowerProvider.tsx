import { useEffect, type ReactNode } from 'react';

interface PowerProviderProps {
  children: ReactNode;
}

export default function PowerProvider({ children }: PowerProviderProps) {
  useEffect(() => {
    const initApp = async () => {
      try {
        const app = await import('@microsoft/power-apps/app');
        if (typeof app.getContext === 'function') {
          await app.getContext();
          console.log('Power Platform SDK initialized successfully');
        }
      } catch (error) {
        console.warn('Power Platform SDK init (optional when running locally):', error);
      }
    };
    initApp();
  }, []);

  return <>{children}</>;
}
