import { Injectable } from '@angular/core';
import { MATERIAS, PROFESORES } from '../data/datos-simulados';
import { Materia, Profesor } from '../models';
import { normalizar } from '../utils/fechas';

/** Catálogo académico: materias y profesores. */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  readonly materias: Materia[] = MATERIAS;
  readonly profesores: Profesor[] = PROFESORES;
  readonly areas = Array.from(new Set(MATERIAS.map((m) => m.area)));

  profesorPorId(id: string): Profesor | undefined {
    return this.profesores.find((p) => p.id === id);
  }

  materiaPorNombre(nombre: string): Materia | undefined {
    const buscado = normalizar(nombre);
    return this.materias.find((m) => normalizar(m.nombre) === buscado);
  }

  /** Indica si un profesor atiende una materia o un tema (búsqueda parcial). */
  atiende(profesor: Profesor, termino: string): boolean {
    const t = normalizar(termino);
    if (!t) return true;
    return [...profesor.materias, ...profesor.temas].some((x) => normalizar(x).includes(t) || t.includes(normalizar(x)));
  }

  /** Materia con la que se registra la solicitud según lo que buscó el estudiante. */
  materiaParaSolicitud(profesor: Profesor, termino: string): string {
    const t = normalizar(termino);
    return profesor.materias.find((m) => normalizar(m).includes(t)) ?? profesor.materias[0];
  }
}
