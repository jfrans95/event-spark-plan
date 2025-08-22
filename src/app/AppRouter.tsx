import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Partners from "@/pages/Partners";  
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import SeedAdmin from "@/pages/SeedAdmin";
import Catalog from "@/pages/Catalog";
import Track from "@/pages/Track";
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

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/aliados" element={<Auth />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/track/:code" element={<Track />} />
      <Route path="/seed-admin" element={<SeedAdmin />} />
      
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
              <ProviderDashboard />
            </ProviderLayout>
          </RoleRoute>
        </PrivateRoute>
      } />
      <Route path="/dashboard/proveedor/perfil" element={
        <PrivateRoute>
          <RoleRoute allowed={['provider']}>
            <ProviderLayout>
              <Perfil />
            </ProviderLayout>
          </RoleRoute>
        </PrivateRoute>
      } />
      <Route path="/dashboard/proveedor/solicitudes" element={
        <PrivateRoute>
          <RoleRoute allowed={['provider']}>
            <ProviderLayout>
              <Solicitudes />
            </ProviderLayout>
          </RoleRoute>
        </PrivateRoute>
      } />
      <Route path="/dashboard/proveedor/inventario" element={
        <PrivateRoute>
          <RoleRoute allowed={['provider']}>
            <ProviderLayout>
              <Inventario />
            </ProviderLayout>
          </RoleRoute>
        </PrivateRoute>
      } />
      <Route path="/dashboard/proveedor/agregar-producto" element={
        <PrivateRoute>
          <RoleRoute allowed={['provider']}>
            <ProviderLayout>
              <AgregarProducto />
            </ProviderLayout>
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};