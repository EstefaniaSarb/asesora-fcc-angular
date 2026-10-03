import { Injectable, inject } from '@angular/core';
import { SEMANAS } from '../data/datos-simulados';
import { Horario, Profesor } from '../models';
import { mismoDia, sumarDias } from '../utils/fechas';
import { RelojService } from './reloj.service';
import { SolicitudService } from './solicitud.service';

export interface DiaDisponibilidad {
  fecha: string;
  horarios: Horario[];
}

/**
 * Calcula los horarios concretos de cada profesor a partir de su patrón
 * semanal, descontando lo ocupado por otras actividades y por solicitudes activas.
 * Como lee signals del SolicitudService, cualquier cambio de estado se refleja solo.
 */
@Injectable({ providedIn: 'root' })
export class DisponibilidadService {
  private readonly solicitudes = inject(SolicitudService);
  private readonly reloj = inject(RelojService);

  readonly semanas = SEMANAS;

  /** Días (lunes a viernes) de una semana con sus horarios y estado. */
  semana(profesor: Profesor, indiceSemana: number, exceptoFolio?: string): DiaDisponibilidad[] {
    const lunes = this.semanas[indiceSemana];
    return [0, 1, 2, 3, 4].map((offset) => {
      const fecha = sumarDias(lunes, offset);
      const patron = profesor.patron.find((p) => p.dia === offset + 1);
      const horarios = (patron?.horas ?? []).map((hora) => this.estadoHorario(profesor, `${fecha}T${hora}`, exceptoFolio));
      return { fecha, horarios };
    });
  }

  /** Todos los horarios libres de las semanas visibles. */
  libres(profesor: Profesor, exceptoFolio?: string): string[] {
    return this.semanas
      .flatMap((_, i) => this.semana(profesor, i, exceptoFolio))
      .flatMap((d) => d.horarios)
      .filter((h) => h.estado === 'disponible')
      .map((h) => h.fechaHora);
  }

  proximoLibre(profesor: Profesor): string | undefined {
    return this.libres(profesor)[0];
  }

  esHoy(fechaHora: string): boolean {
    return mismoDia(fechaHora, this.reloj.hoy);
  }

  esEstaSemana(fechaHora: string): boolean {
    const fin = sumarDias(this.semanas[0], 5);
    return fechaHora.slice(0, 10) >= this.semanas[0] && fechaHora.slice(0, 10) < fin;
  }

  private estadoHorario(profesor: Profesor, fechaHora: string, exceptoFolio?: string): Horario {
    if (fechaHora < this.reloj.ahora()) return { fechaHora, estado: 'pasado' };
    const ocupado = profesor.ocupados.includes(fechaHora) || this.solicitudes.horarioOcupado(profesor.id, fechaHora, exceptoFolio);
    return { fechaHora, estado: ocupado ? 'ocupado' : 'disponible' };
  }
}
