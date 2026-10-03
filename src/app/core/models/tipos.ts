/** Rol con el que se recorre el prototipo. */
export type Rol = 'estudiante' | 'profesor';

/** Estados posibles de una solicitud de asesoría. */
export type EstadoSolicitud =
  | 'Pendiente'
  | 'Confirmada'
  | 'Reprogramación propuesta'
  | 'Rechazada'
  | 'Cancelada'
  | 'Completada'
  | 'Inasistencia';

/** Estados en los que la solicitud sigue viva (no es final). */
export const ESTADOS_ACTIVOS: EstadoSolicitud[] = ['Pendiente', 'Confirmada', 'Reprogramación propuesta'];

/** Estados finales que pasan al historial. */
export const ESTADOS_FINALES: EstadoSolicitud[] = ['Completada', 'Inasistencia', 'Rechazada', 'Cancelada'];

export type Modalidad = 'Presencial' | 'En línea';
