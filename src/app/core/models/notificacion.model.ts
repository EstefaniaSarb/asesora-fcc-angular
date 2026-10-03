import { Rol } from './tipos';

export type TipoNotificacion = 'solicitud' | 'estado' | 'recordatorio';

export interface Notificacion {
  id: number;
  rol: Rol;
  tipo: TipoNotificacion;
  titulo: string;
  texto: string;
  /** Fecha y hora local ISO. */
  fecha: string;
  leida: boolean;
  /** Ruta a la que lleva la notificación. */
  destino: string;
}
