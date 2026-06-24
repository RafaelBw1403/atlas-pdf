import { useEffect, useRef } from 'react';
import 'altcha';
import Swal from 'sweetalert2';
import { isLocalMode } from '../../helpers/env.helpers';

const URL_API_BACK = import.meta.env.VITE_API_BACK_URL;

interface AltchaWidgetProps {
  onVerify: (payload: string | null) => void;
  reset?: boolean;
}

export const AltchaComponent = ({ onVerify, reset }: AltchaWidgetProps) => {
  if (isLocalMode()) {
    return null;
  }
  const widgetRef = useRef<any>(null);

  // Reset automático cuando reset = true
  useEffect(() => {
    if (reset && widgetRef.current) {
      if (typeof widgetRef.current.reset === 'function') {
        widgetRef.current.reset();
      }
    }
  }, [reset]);

//   useEffect(() => {
//     const widget = widgetRef.current;

//     if (widget) {
//       const handleStateChange = (e: any) => {
//         const { state, payload } = e.detail;

//         if( !payload ){
//             Swal
//         }
        
//         if (state === 'verified' && payload) {
//           onVerify(payload);
//         }
//       };

//       widget.addEventListener('statechange', handleStateChange);
//       return () => widget.removeEventListener('statechange', handleStateChange);
//     }
//   }, [onVerify]);

    useEffect(() => {
        const widget = widgetRef.current;

        if (widget) {
            const handleStateChange = (e: any) => {
            const { state, payload, error } = e.detail;
            
            console.log('ALTCHA state:', state, payload ? 'con payload' : 'sin payload');
            
            switch(state) {
                case 'verified':
                if (payload) {
                    // Payload válido
                    onVerify(payload);
                } else {
                    // Estado verified pero sin payload - posible error
                    console.error('Estado verified pero sin payload');
                    Swal.fire({
                    icon: 'error',
                    title: 'Error de verificación',
                    text: 'La verificación no completó correctamente. Intenta de nuevo.',
                    timer: 3000,
                    showConfirmButton: false
                    });
                    onVerify(null);
                }
                break;
                
                case 'error':
                console.error('Error en ALTCHA:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de seguridad',
                    text: error?.message || 'Error en la verificación. Intenta de nuevo.',
                    timer: 3000,
                    showConfirmButton: false
                });
                onVerify(null);
                break;
                
                case 'expired':
                Swal.fire({
                    icon: 'warning',
                    title: 'Verificación expirada',
                    text: 'El tiempo de verificación expiró. Por favor, intenta de nuevo.',
                    timer: 3000,
                    showConfirmButton: false
                });
                onVerify(null);
                break;
                
                case 'verifying':
                // Opcional: mostrar algún indicador de carga
                console.log('Verificando...');
                break;
                
                default:
                // Cualquier otro estado (unverified, etc)
                onVerify(null);
                break;
            }
            };

            widget.addEventListener('statechange', handleStateChange);
            return () => widget.removeEventListener('statechange', handleStateChange);
        }
    }, [onVerify]);

  return (
    <div 
        style={{ 
            marginBottom: 16, 
            display: 'flex',
            justifyContent: 'center'
        }}
    >
      <altcha-widget
        ref={widgetRef}
        challengeurl={`${URL_API_BACK}/api/altcha/generateAltchaChallenge`}
        hidefooter
        hidelogo
        strings={JSON.stringify({
          label: 'No soy un robot!',
          placeholder: 'Cargando seguridad...',
          verifying: 'Validando...',
          verified: 'Identidad confirmada'
        })}
      ></altcha-widget>
    </div>
  );
};