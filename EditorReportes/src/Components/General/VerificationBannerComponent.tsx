// import { useState, useEffect } from 'react';
// import { useMutation } from '@apollo/client/react';
// import { REQUEST_EMAIL_VERIFICATION } from '../graphql/auth.operations'; // Nueva operación

// const VerificationBanner = ({ user }) => {
//   const [cooldown, setCooldown] = useState(0);
//   const [requestVerification] = useMutation(REQUEST_EMAIL_VERIFICATION);

//   // 1. Manejo del Timer de 2 minutos (Frontend)
//   useEffect(() => {
//     if (cooldown > 0) {
//       const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [cooldown]);

//   // No mostrar nada si ya está verificado
//   if (user.is_verified) return null;

//   const handleResend = async () => {
//     try {
//       await requestVerification({ variables: { email: user.email } });
//       setCooldown(120); // Activamos los 2 minutos de espera
//       alert("Correo de verificación enviado.");
//     } catch (error: any) {
//       // Capturamos el error del back (Ej: "Debes esperar...")
//       alert(error.message);
//     }
//   };

//   // 2. Estilo Dinámico según la urgencia
//   const isUrgent = user.daysUntilDeletion <= 2;
//   const bannerClass = isUrgent ? 'bg-red-500' : 'bg-yellow-500';

//   return (
//     <div className={`p-4 text-white ${bannerClass} flex justify-between items-center`}>
//       <span>
//         ⚠️ Tu cuenta no está verificada. Será eliminada en 
//         <strong> {user.daysUntilDeletion} días</strong>.
//       </span>
//       <button 
//         onClick={handleResend} 
//         disabled={cooldown > 0}
//         className="ml-4 px-3 py-1 bg-white text-black rounded disabled:opacity-50"
//       >
//         {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar Correo'}
//       </button>
//     </div>
//   );
// };