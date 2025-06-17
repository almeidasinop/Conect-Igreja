import { useCallback } from 'react';

// Define a interface para o Navigator com a Badging API
interface NavigatorWithBadging extends Navigator {
  setAppBadge: (count?: number) => Promise<void>;
  clearAppBadge: () => Promise<void>;
}

/**
 * Hook personalizado para interagir com a Badging API do navegador.
 * Fornece métodos para definir e limpar o selo de notificação no ícone do PWA.
 */
export const useBadging = () => {
  const isSupported = typeof window !== 'undefined' && 'setAppBadge' in navigator;

  const setBadge = useCallback(async (count: number) => {
    if (!isSupported) {
      console.log('Badging API não é suportada neste navegador.');
      return;
    }
    try {
      await (navigator as NavigatorWithBadging).setAppBadge(count);
    } catch (error) {
      console.error('Falha ao definir o selo de notificação:', error);
    }
  }, [isSupported]);

  const clearBadge = useCallback(async () => {
    if (!isSupported) {
      console.log('Badging API não é suportada neste navegador.');
      return;
    }
    try {
      await (navigator as NavigatorWithBadging).clearAppBadge();
    } catch (error) {
      console.error('Falha ao limpar o selo de notificação:', error);
    }
  }, [isSupported]);

  return { setBadge, clearBadge, isSupported };
};
