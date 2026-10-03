import { Modalidad } from './tipos';

/** Patrón semanal de horarios de atención: día (1 = lunes) y horas "HH:mm". */
export interface PatronSemanal {
  dia: 1 | 2 | 3 | 4 | 5;
  horas: string[];
}

export interface Profesor {
  id: string;
  nombre: string;
  iniciales: string;
  grado: string;
  materias: string[];
  temas: string[];
  modalidades: Modalidad[];
  ubicacion: string;
  color: string;
  /** Horarios de atención que se repiten cada semana. */
  patron: PatronSemanal[];
  /** Horarios ocupados por otras actividades (fecha y hora local ISO). */
  ocupados: string[];
}

/** Un horario concreto de un profesor y su estado para el estudiante. */
export interface Horario {
  fechaHora: string;
  estado: 'disponible' | 'ocupado' | 'pasado';
}
