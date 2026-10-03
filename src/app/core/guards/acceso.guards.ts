import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rol } from '../models';
import { BorradorSolicitudService } from '../services/borrador-solicitud.service';
import { SesionService } from '../services/sesion.service';

/** Exige haber elegido un rol en la pantalla de acceso. */
export const sesionGuard: CanActivateFn = () => {
  const sesion = inject(SesionService);
  return sesion.autenticado() || inject(Router).createUrlTree(['/acceso']);
};

/** Restringe una sección a un rol; si no corresponde, envía al inicio del rol activo. */
export function rolGuard(rol: Rol): CanActivateFn {
  return () => {
    const sesion = inject(SesionService);
    return sesion.rol() === rol || inject(Router).createUrlTree([sesion.inicioDe()]);
  };
}

/** Impide abrir "Nueva solicitud" sin haber elegido docente y horario. */
export const borradorGuard: CanActivateFn = () => {
  const borrador = inject(BorradorSolicitudService);
  return borrador.listoParaDetalles() || inject(Router).createUrlTree(['/estudiante/materias']);
};
