import { peopleOutline, documentTextOutline, createOutline, pencilOutline } from 'ionicons/icons';
import React from 'react';

export type AppRoute = {
  path: string;              
  exact?: boolean;
  component: React.ComponentType<any>;
  menuLabel?: string;        
  icon?: string;             
  roles?: string[];          
};

const UsersPage      = React.lazy(() => import('../pages/login/RequestsPage'));
const RequestsPage   = React.lazy(() => import('../pages/login/RequestsPage'));

const FormList       = React.lazy(() => import('../pages/login/UsersPage'));      // crea el archivo
const FormCreate     = React.lazy(() => import('../pages/login/UsersPage'));
const FormEdit       = React.lazy(() => import('../pages/login/UsersPage'));

// solicitudes
const SolCreate      = React.lazy(() => import('../pages/login/RequestsPage'));
const SolEdit        = React.lazy(() => import('../pages/login/RequestsPage'));

export const appRoutes: AppRoute[] = [
  // Menú principal
  { path: '/app/users',     exact: true, component: UsersPage,    menuLabel: 'Usuarios',    icon: peopleOutline },
  { path: '/app/requests',  exact: true, component: RequestsPage, menuLabel: 'Solicitudes', icon: peopleOutline },

  // Formularios (solo algunos en menú, otros ocultos)
  { path: '/app/formularios/vista',     exact: true, component: FormList,   menuLabel: 'Formularios', icon: createOutline },
  { path: '/app/formularios/creacion',  exact: true, component: FormCreate },
  { path: '/app/formularios/edicion/:id', exact: true, component: FormEdit },

  // Solicitudes (rutas de trabajo, sin menú)
  { path: '/app/solicitudes/crear',     exact: true, component: SolCreate },
  { path: '/app/solicitudes/editar/:id', exact: true, component: SolEdit, icon: pencilOutline },
];
