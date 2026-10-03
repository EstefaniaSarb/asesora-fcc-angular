import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AvisoService } from '../../core/services/aviso.service';
import { SesionService } from '../../core/services/sesion.service';
import { EstadoVacioComponent } from '../../shared/components/estado-vacio.component';
import { TituloPaginaComponent } from '../../shared/components/titulo-pagina.component';
import { FechaAsesoriaPipe } from '../../shared/pipes/fecha-asesoria.pipe';

interface Bloque { inicio: string; fin: string; }
interface Dia { nombre: string; activo: boolean; bloques: Bloque[]; }
interface Excepcion { fecha: string; motivo: string; }

const HORAS = Array.from({ length: 27 }, (_, i) => {
  const minutos = 7 * 60 + i * 30;
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
});

const aMinutos = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));

/** P9. Gestión de disponibilidad semanal del profesor. */
@Component({
  selector: 'app-gestion-disponibilidad',
  imports: [FormsModule, MatIconModule, EstadoVacioComponent, TituloPaginaComponent, FechaAsesoriaPipe],
  templateUrl: './gestion-disponibilidad.page.html',
})
export class GestionDisponibilidadPage {
  private readonly aviso = inject(AvisoService);
  private readonly sesion = inject(SesionService);

  protected readonly horas = HORAS;
  protected readonly duraciones = [30, 45, 60];
  protected readonly duracion = signal(45);

  protected readonly dias = signal<Dia[]>([
    { nombre: 'Lunes', activo: true, bloques: [{ inicio: '10:00', fin: '13:00' }, { inicio: '16:00', fin: '18:00' }] },
    { nombre: 'Martes', activo: true, bloques: [{ inicio: '09:00', fin: '12:00' }] },
    { nombre: 'Miércoles', activo: true, bloques: [{ inicio: '10:00', fin: '14:00' }] },
    { nombre: 'Jueves', activo: true, bloques: [{ inicio: '12:00', fin: '17:00' }] },
    { nombre: 'Viernes', activo: true, bloques: [] },
  ]);
  protected readonly excepciones = signal<Excepcion[]>([{ fecha: '2026-10-23T00:00', motivo: 'Consejo de Unidad Académica' }]);

  /** Día en el que se está agregando un bloque y sus valores. */
  protected readonly agregandoEn = signal<string | null>(null);
  protected readonly nuevoInicio = signal('14:00');
  protected readonly nuevoFin = signal('15:00');
  protected readonly errorBloque = signal('');

  protected readonly agregandoExcepcion = signal(false);
  protected readonly nuevaFecha = signal('');
  protected readonly nuevoMotivo = signal('');

  protected readonly horasSemana = computed(() => {
    const min = this.dias()
      .filter((d) => d.activo)
      .flatMap((d) => d.bloques)
      .reduce((t, b) => t + aMinutos(b.fin) - aMinutos(b.inicio), 0);
    return min / 60;
  });
  protected readonly asesoriasPosibles = computed(() => Math.floor((this.horasSemana() * 60) / this.duracion()));

  protected alternarDia(nombre: string): void {
    this.dias.update((ds) => ds.map((d) => (d.nombre === nombre ? { ...d, activo: !d.activo } : d)));
  }

  protected abrirBloque(nombre: string): void {
    this.agregandoEn.set(nombre);
    this.errorBloque.set('');
  }

  protected guardarBloque(nombre: string): void {
    const inicio = this.nuevoInicio();
    const fin = this.nuevoFin();
    if (aMinutos(fin) - aMinutos(inicio) < this.duracion()) {
      this.errorBloque.set(`El bloque debe durar al menos ${this.duracion()} minutos.`);
      return;
    }
    const dia = this.dias().find((d) => d.nombre === nombre)!;
    const traslape = dia.bloques.some((b) => aMinutos(inicio) < aMinutos(b.fin) && aMinutos(fin) > aMinutos(b.inicio));
    if (traslape) {
      this.errorBloque.set('El bloque se traslapa con otro del mismo día.');
      return;
    }
    this.dias.update((ds) =>
      ds.map((d) => (d.nombre === nombre ? { ...d, bloques: [...d.bloques, { inicio, fin }].sort((a, b) => a.inicio.localeCompare(b.inicio)) } : d)),
    );
    this.agregandoEn.set(null);
  }

  protected eliminarBloque(nombre: string, indice: number): void {
    this.dias.update((ds) => ds.map((d) => (d.nombre === nombre ? { ...d, bloques: d.bloques.filter((_, i) => i !== indice) } : d)));
  }

  protected guardarExcepcion(): void {
    if (!this.nuevaFecha() || !this.nuevoMotivo().trim()) return;
    this.excepciones.update((ex) => [...ex, { fecha: `${this.nuevaFecha()}T00:00`, motivo: this.nuevoMotivo().trim() }].sort((a, b) => a.fecha.localeCompare(b.fecha)));
    this.agregandoExcepcion.set(false);
    this.nuevaFecha.set('');
    this.nuevoMotivo.set('');
  }

  protected eliminarExcepcion(fecha: string): void {
    this.excepciones.update((ex) => ex.filter((e) => e.fecha !== fecha));
  }

  protected guardar(): void {
    this.aviso.exito(`Disponibilidad guardada: ${this.horasSemana()} h por semana para ${this.sesion.profesor.nombre}.`);
  }
}
