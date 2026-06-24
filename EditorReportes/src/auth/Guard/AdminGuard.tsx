
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';


interface AdminGuardProps {
    children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
    const canAdmin = useAuthStore(state => state.canAdminister());

    if (!canAdmin) {
        console.warn("Acceso denegado: Se requiere ser Admin");
        return <Navigate to="/app/documents" replace />;
    }

    return <>{children}</>;
};