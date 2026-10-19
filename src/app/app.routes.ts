import { Routes } from '@angular/router';
import { adminGuard } from './services/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home.page').then((m) => m.HomePage),
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin-login.page').then((m) => m.AdminLoginPage),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin-layout.page').then((m) => m.AdminLayoutPage),
    children: [
      {
        path: 'autos',
        loadComponent: () => import('./pages/admin-autos.page').then((m) => m.AdminAutosPage),
      },
      {
        path: 'autos/nuevo',
        loadComponent: () => import('./pages/admin-nuevo-auto.page').then((m) => m.AdminNuevoAutoPage),
      },
      {
        path: 'integraciones',
        loadComponent: () =>
          import('./pages/admin-integraciones.page').then((m) => m.AdminIntegracionesPage),
      },
      {
        path: 'mercado',
        loadComponent: () => import('./pages/admin-mercado.page').then((m) => m.AdminMercadoPage),
      },
      {
        path: '',
        redirectTo: 'autos',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'empresa',
    loadComponent: () => import('./pages/empresa.page').then((m) => m.EmpresaPage),
  },
  {
    path: 'autos',
    loadComponent: () => import('./pages/autos.page').then((m) => m.AutosPage),
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contacto.page').then((m) => m.ContactoPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
