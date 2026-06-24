// RequireAuth.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import type { ReactNode } from 'react';

interface RequireAuthProps {
    children: ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
    const isAuth = useAuthStore((s) => s.isAuth);
    const location = useLocation();

    if (!isAuth) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
};
