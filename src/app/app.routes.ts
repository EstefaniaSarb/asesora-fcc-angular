import { Routes } from '@angular/router';
import { borradorGuard, rolGuard, sesionGuard } from './core/guards/acceso.guards';

/**
 * Rutas de la SPA. Coinciden con las del prototipo de Figma Make.
 * Cada pantalla se carga de forma diferida (loadComponent).
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'acceso' },
  {
    path: 'acceso', title: 'Acceso | AsesoraFCC',
    loadComponent: () => import('./pages/acceso/acceso.page').then((m) => m.AccesoPage),
  },
  {
    path: '',
    canActivate: [sesionGuard],
    loadComponent: () => import('./layout/marco-aplicacion.component').then((m) => m.MarcoAplicacionComponent),
    children: [
      {
        path: 'estudiante',
        canActivate: [rolGuard('estudiante')],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'inicio' },
          { path: 'inicio', title: 'Inicio | AsesoraFCC',
            loadComponent: () => import('./pages/estudiante/inicio-estudiante.page').then((m) => m.InicioEstudiantePage) },
          { path: 'materias', title: 'Buscar asesoría | AsesoraFCC',
            loadComponent: () => import('./pages/estudiante/materias.page').then((m) => m.MateriasPage) },
          { path: 'profesores', title: 'Profesores disponibles | AsesoraFCC',
            loadComponent: () => import('./pages/estudiante/profesores.page').then((m) => m.ProfesoresPage) },
          { path: 'profesores/:id/disponibilidad', title: 'Disponibilidad | AsesoraFCC',
            loadComponent: () => import('./pages/estudiante/disponibilidad-profesor.page').then((m) => m.DisponibilidadProfesorPage) },
          { path: 'solicitudes/nueva', title: 'Nueva solicitud | AsesoraFCC', canActivate: [borradorGuard],
            loadComponent: () => import('./pages/estudiante/nueva-solicitud.page').then((m) => m.NuevaSolicitudPage) },
          { path: 'solicitudes', title: 'Mis solicitudes | AsesoraFCC',
            loadComponent: () => import('./pages/estudiante/mis-solicitudes.page').then((m) => m.MisSolicitudesPage) },
          { path: 'solicitudes/:folio', title: 'Detalle de solicitud | AsesoraFCC',
            loadComponent: () => import('./pages/estudiante/detalle-solicitud.page').then((m) => m.DetalleSolicitudPage) },
        ],
      },
      {
        path: 'profesor',
        canActivate: [rolGuard('profesor')],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'panel' },
          { path: 'panel', title: 'Panel docente | AsesoraFCC',
            loadComponent: () => import('./pages/profesor/panel-profesor.page').then((m) => m.PanelProfesorPage) },
          { path: 'solicitudes', title: 'Solicitudes | AsesoraFCC',
            loadComponent: () => import('./pages/profesor/bandeja-solicitudes.page').then((m) => m.BandejaSolicitudesPage) },
          { path: 'disponibilidad', title: 'Mi disponibilidad | AsesoraFCC',
            loadComponent: () => import('./pages/profesor/gestion-disponibilidad.page').then((m) => m.GestionDisponibilidadPage) },
        ],
      },
      { path: 'notificaciones', title: 'Notificaciones | AsesoraFCC',
        loadComponent: () => import('./pages/notificaciones.page').then((m) => m.NotificacionesPage) },
      { path: 'perfil', title: 'Mi perfil | AsesoraFCC',
        loadComponent: () => import('./pages/perfil.page').then((m) => m.PerfilPage) },
      { path: '**', title: 'Página no encontrada | AsesoraFCC',
        loadComponent: () => import('./pages/no-encontrada.page').then((m) => m.NoEncontradaPage) },
    ],
  },
];
