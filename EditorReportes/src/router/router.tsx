// router.tsx - Versión final
import { Navigate, type RouteObject } from "react-router-dom";
import { LoginComponent } from "../auth/LoginComponent";
import LayoutApp from "../layouts/LayoutApp";
import { RequireAuth } from "../auth/RequireAuth";
import { DocumentPage } from "../Components/Documents/DocumentPage";
import { EditorStudioComponent } from "../Components/EditorStudioComponent";
import { FolderPage } from "../Components/Documents/Folderpage";
import { ApiKeyPage } from "../Components/ApiKey/ApiKeyPage";
import { AdminUsersPage } from "../Components/Admin/AdminUsersPage";
// import { VerifyEmailPage } from "../auth/VerifyEmailPage";
import { ResetPasswordPage } from "../auth/ResetPasswordPage";
import { AdminGuard } from "../auth/Guard/AdminGuard";
import { ChangePasswordComponent } from "../auth/ChangePasswordComponent";
import Dashboard from "../Components/Dashboard/DashboardPage";
import { DocumentationPage } from "../Components/Documentation/DocumentationPage";
import { ApiReferencePage } from "../Components/ApiReference/ApiReferencePage";
import BetaWelcomePage from "../Components/BetaWelcome/BetaWelcomePage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/app" replace />,
  },
  {
    path: "/login",
    element: <LoginComponent />,
  },
  // {
  //   path: "/verify-email",
  //   element: <VerifyEmailPage />,
  // },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/app",
    element: (
      <RequireAuth>
        <LayoutApp />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <BetaWelcomePage /> },
      { path: "editor/:operation?/:documentId?", element: <EditorStudioComponent/> },
      { path: "documents", element: <DocumentPage /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "folders/:folderId", element: <FolderPage /> },
      { path: "api-key", element: <ApiKeyPage /> },
      { path: "changePassword", element: <ChangePasswordComponent/>},
      { 
        path: 'admin', 
        element: (
          <AdminGuard>
            <AdminUsersPage />
          </AdminGuard>
        ) 
      },
      { path: "documentation", element: <DocumentationPage /> },
      { path: "api-reference", element: <ApiReferencePage /> }
    ],
  },
  { path: '*', element: <Navigate to="/app" replace /> },
];
export default routes;