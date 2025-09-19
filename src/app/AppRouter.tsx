import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Partners from "@/pages/Partners";  
import Logout from "@/pages/Logout";
import AuthTest from "@/pages/AuthTest";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import SeedAdmin from "@/pages/SeedAdmin";
import SeedDemo from "@/pages/SeedDemo";
import Catalog from "@/pages/Catalog";
import Track from "@/pages/Track";
import UserDashboard from "@/pages/UserDashboard";
import NotFound from "@/pages/NotFound";

// Role-specific layouts and pages
import { PrivateRoute } from "./routes/PrivateRoute";
import { RoleRoute } from "./routes/RoleRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdvisorLayout } from "./layouts/AdvisorLayout";
import { CollaboratorLayout } from "./layouts/CollaboratorLayout";
import { ProviderLayout } from "./layouts/ProviderLayout";

import AdminDashboard from "@/pages/dashboard/admin/AdminDashboard";
import GestionPersonal from "@/pages/dashboard/admin/GestionPersonal";
import InventarioGeneral from "@/pages/dashboard/admin/InventarioGeneral";

import AdvisorDashboard from "@/pages/dashboard/advisor/AdvisorDashboard";

import CollaboratorDashboard from "@/pages/dashboard/collaborator/CollaboratorDashboard";

import ProviderDashboard from "@/pages/dashboard/provider/ProviderDashboard";
import Perfil from "@/pages/dashboard/provider/Perfil";
import Solicitudes from "@/pages/dashboard/provider/Solicitudes";
import Inventario from "@/pages/dashboard/provider/Inventario";
import AgregarProducto from "@/pages/dashboard/provider/AgregarProducto";
import ProviderWrapper from "@/components/ProviderWrapper";
import ProviderRegistration from "@/pages/ProviderRegistration";
import ProviderApplicationPending from "@/pages/ProviderApplicationPending";

import EditarProducto from "@/pages/dashboard/provider/EditarProducto";

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth-test" element={<AuthTest />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/track/:code" element={<Track />} />
      <Route path="/tracking/:code" element={<Track />} />
      <Route path="/user" element={
        <PrivateRoute>
          <UserDashboard />
        </PrivateRoute>
      } />
      <Route path="/seed-admin" element={<SeedAdmin />} />
      <Route path="/seed-demo" element={<SeedDemo />} />
      
      {/* Provider public routes */}
      <Route path="/proveedor/registro" element={<ProviderRegistration />} />
      <Route path="/proveedor/solicitud-enviada" element={<ProviderApplicationPending />} />

      {/* Dashboard redirect route */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />

      {/* Admin routes */}
      <Route path="/dashboard/admin" element={
        <PrivateRoute>
          <RoleRoute allowed={['administrator']}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </RoleRoute>
        </PrivateRoute>
      } />
      <Route path="/dashboard/admin/personal" element={
        <PrivateRoute>
          <RoleRoute allowed={['administrator']}>
            <AdminLayout>
              <GestionPersonal />
            </AdminLayout>
          </RoleRoute>
        </PrivateRoute>
      } />
      <Route path="/dashboard/admin/inventario" element={
        <PrivateRoute>
          <RoleRoute allowed={['administrator']}>
            <AdminLayout>
              <InventarioGeneral />
            </AdminLayout>
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* Advisor routes */}
      <Route path="/dashboard/asesor" element={
        <PrivateRoute>
          <RoleRoute allowed={['advisor']}>
            <AdvisorLayout>
              <AdvisorDashboard />
            </AdvisorLayout>
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* Collaborator routes */}
      <Route path="/dashboard/colaborador" element={
        <PrivateRoute>
          <RoleRoute allowed={['collaborator']}>
            <CollaboratorLayout>
              <CollaboratorDashboard />
            </CollaboratorLayout>
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* Provider routes */}
      <Route path="/dashboard/proveedor" element={
        <PrivateRoute>
          <RoleRoute allowed={['provider']}>
            <ProviderLayout>
              <ProviderWrapper>
                <ProviderDashboard />
              </ProviderWrapper>
            </ProviderLayout>
          </RoleRoute>
        </PrivateRoute>
      } />
      <Route path="/dashboard/proveedor/perfil" element={
        <PrivateRoute>
          <RoleRoute allowed={['provider']}>
            <ProviderLayout>
              <ProviderWrapper>
                <Perfil />
              </ProviderWrapper>
            </ProviderLayout>
          </RoleRoute>
        </PrivateRoute>
      } />
      <Route path="/dashboard/proveedor/solicitudes" element={
        <PrivateRoute>
          <RoleRoute allowed={['provider']}>
            <ProviderLayout>
              <ProviderWrapper>
                <Solicitudes />
              </ProviderWrapper>
            </ProviderLayout>
          </RoleRoute>
        </PrivateRoute>
      } />
      <Route path="/dashboard/proveedor/inventario" element={
        <PrivateRoute>
          <RoleRoute allowed={['provider']}>
            <ProviderLayout>
              <ProviderWrapper>
                <Inventario />
              </ProviderWrapper>
            </ProviderLayout>
          </RoleRoute>
        </PrivateRoute>
      } />
      <Route path="/dashboard/proveedor/agregar-producto" element={
        <PrivateRoute>
          <RoleRoute allowed={['provider']}>
            <ProviderLayout>
              <ProviderWrapper>
                <AgregarProducto />
              </ProviderWrapper>
            </ProviderLayout>
          </RoleRoute>
        </PrivateRoute>
      } />
      <Route path="/dashboard/proveedor/editar-producto/:productId" element={
        <PrivateRoute>
          <RoleRoute allowed={['provider']}>
            <ProviderLayout>
              <ProviderWrapper>
                <EditarProducto />
              </ProviderWrapper>
            </ProviderLayout>
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};