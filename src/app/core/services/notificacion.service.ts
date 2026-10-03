import { Injectable, inject, signal } from '@angular/core';
import { NOTIFICACIONES_INICIALES } from '../data/datos-simulados';
import { Notificacion, Rol } from '../models';
import { RelojService } from './reloj.service';

/** Centro de notificaciones compartido por ambos roles. */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly reloj = inject(RelojService);
  private readonly lista = signal<Notificacion[]>(NOTIFICACIONES_INICIALES);
  private siguienteId = NOTIFICACIONES_INICIALES.length + 1;

  readonly notificaciones = this.lista.asReadonly();

  delRol(rol: Rol | null): Notificacion[] {
    return this.lista().filter((n) => n.rol === rol);
  }

  noLeidas(rol: Rol | null): number {
    return this.delRol(rol).filter((n) => !n.leida).length;
  }

  agregar(datos: Omit<Notificacion, 'id' | 'fecha' | 'leida'>): void {
    const nueva: Notificacion = { ...datos, id: this.siguienteId++, fecha: this.reloj.ahora(), leida: false };
    this.lista.update((actual) => [nueva, ...actual]);
  }

  marcarLeida(id: number, leida = true): void {
    this.lista.update((actual) => actual.map((n) => (n.id === id ? { ...n, leida } : n)));
  }

  marcarTodas(rol: Rol): void {
    this.lista.update((actual) => actual.map((n) => (n.rol === rol ? { ...n, leida: true } : n)));
  }
}
