// import { useEffect } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';

// import { Result, Button, Spin, Typography, Card } from 'antd';
// import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
// import { VERIFY_EMAIL } from '../graphql/operations/graphql.auth.operations';
// import { useMutation } from '@apollo/client/react';

// const { Text } = Typography;

// interface VerifyEmailData {
//   verifyEmail: boolean;
// }

// interface VerifyEmailVars {
//   token: string;
// }

// export const VerifyEmailPage = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const token = searchParams.get('token'); 

//   const [verifyEmail, { loading, error, data }] = useMutation<VerifyEmailData, VerifyEmailVars>(VERIFY_EMAIL);

// //   useEffect(() => {
// //     if (token) {
// //       verifyEmail({ 
// //         variables: { token }, 
// //         refetchQueries: ['me', 'Login'] 
// //       }).catch(e => console.error("Error en la mutación:", e));
// //     }
// //   }, [token, verifyEmail]);

//   // Contenedor centrado para todos los estados
//   const Container = ({ children }: { children: React.ReactNode }) => (
//     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
//       <Card style={{ width: 500, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
//         {children}
//       </Card>
//     </div>
//   );

//   // 1. Estado de Carga
//   if (loading) {
//     return (
//       <Container>
//         <div style={{ textAlign: 'center', padding: '40px 0' }}>
//           <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
//           <div style={{ marginTop: 24 }}>
//             <Typography.Title level={4}>Verificando tu cuenta</Typography.Title>
//             <Text type="secondary">Estamos validando tus credenciales, por favor espera un momento.</Text>
//           </div>
//         </div>
//       </Container>
//     );
//   }

//   // 2. Estado de Error (Token expirado o inválido) 
//   if (error) {
//     return (
//       <Container>
//         <Result
//           status="error"
//           title="Error de Verificación"
//           subTitle={error.message}
//           icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
//           extra={[
//             <Button type="primary" key="login" onClick={() => navigate('/login')} size="large">
//               Regresar al Login
//             </Button>
//           ]}
//         />
//       </Container>
//     );
//   }

//   // 3. Estado de Éxito 
//   if (data?.verifyEmail === true) {
//     return (
//       <Container>
//         <Result
//           status="success"
//           title="¡Cuenta Verificada Exitosamente!"
//           subTitle="Tu correo ha sido confirmado. Ahora tienes acceso total a todas las funcionalidades."
//           icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
//           extra={[
//             <Button type="primary" key="dashboard" onClick={() => navigate('/app/login')} size="large">
//               Ir al Dashboard
//             </Button>
//           ]}
//         />
//       </Container>
//     );
//   }

//   // 4. Estado inicial sin token
//   return (
//     <Container>
//         <Result
//         status="info"
//         title="Verificación de cuenta"
//         subTitle="Haz clic en el botón de abajo para activar tu cuenta."
//         extra={
//             <Button 
//             type="primary" 
//             size="large" 
//             loading={loading} // Muestra el spinner de AntD en el botón
//             onClick={() => verifyEmail({ variables: { token: token || '' } })}
//             >
//             Verificar ahora
//             </Button>
//         }
//         />
//     </Container>
//     );
// };