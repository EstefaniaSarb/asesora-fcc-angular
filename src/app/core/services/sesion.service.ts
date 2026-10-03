import { Injectable, computed, signal } from '@angular/core';
import { ESTUDIANTE_ACTUAL, PROFESOR_ACTUAL_ID, PROFESORES } from '../data/datos-simulados';
import { Rol } from '../models';

/**
 * Sesión simulada. En producción se reemplazaría por la autenticación
 * institucional; aquí solo guarda el rol elegido en la pantalla de acceso.
 */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly rolActual = signal<Rol | null>(null);

  readonly rol = this.rolActual.asReadonly();
  readonly autenticado = computed(() => this.rolActual() !== null);
  readonly esEstudiante = computed(() => this.rolActual() === 'estudiante');

  readonly profesor = PROFESORES.find((p) => p.id === PROFESOR_ACTUAL_ID)!;
  readonly estudiante = ESTUDIANTE_ACTUAL;

  readonly nombreUsuario = computed(() =>
    this.rolActual() === 'profesor' ? this.profesor.nombre : this.estudiante.nombre,
  );

  iniciar(rol: Rol): void {
    this.rolActual.set(rol);
  }

  cambiarRol(): Rol {
    const siguiente: Rol = this.rolActual() === 'estudiante' ? 'profesor' : 'estudiante';
    this.rolActual.set(siguiente);
    return siguiente;
  }

  /** Ruta de inicio de cada rol. */
  inicioDe(rol: Rol | null = this.rolActual()): string {
    return rol === 'profesor' ? '/profesor/panel' : '/estudiante/inicio';
  }
}
