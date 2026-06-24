import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { isLocalMode } from '../helpers/env.helpers';

interface UseAltchaReturn {
  altchaPayload: string | null;
  resetAltcha: boolean;
  setResetAltcha: (reset: boolean) => void;
  handleAltchaVerify: (payload: string | null) => void;
  validateAltcha: (showAlert?: boolean) => boolean;
  resetAltchaComponent: () => void;
}

const LOCAL_DUMMY_PAYLOAD = 'local-mode-altcha-skip';

export const useAltcha = (): UseAltchaReturn => {
  const [altchaPayload, setAltchaPayload] = useState<string | null>(
    isLocalMode() ? LOCAL_DUMMY_PAYLOAD : null
  );
  const [resetAltcha, setResetAltcha] = useState(false);

  const handleAltchaVerify = useCallback((payload: string | null) => {
    if (isLocalMode()) {
      setAltchaPayload(LOCAL_DUMMY_PAYLOAD);
      return;
    }
    setAltchaPayload(payload);
  }, []);

  const validateAltcha = useCallback((showAlert: boolean = true): boolean => {
    if (isLocalMode()) return true;
    if (!altchaPayload) {
      if (showAlert) {
        Swal.fire({
            icon: 'warning',
            title: 'Verificación requerida',
            text: 'Por favor, completa la verificación de seguridad.',
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
      }
      return false;
    }
    return true;
  }, [altchaPayload]);

  const resetAltchaComponent = useCallback(() => {
    setResetAltcha(true);
    setAltchaPayload(isLocalMode() ? LOCAL_DUMMY_PAYLOAD : null);
    setTimeout(() => setResetAltcha(false), 100);
  }, []);

  return {
    altchaPayload,
    resetAltcha,
    setResetAltcha,
    handleAltchaVerify,
    validateAltcha,
    resetAltchaComponent
  };
};