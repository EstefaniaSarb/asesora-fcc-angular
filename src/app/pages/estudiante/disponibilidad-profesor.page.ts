import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { textoModalidades } from '../../core/utils/fechas';
import { Horario } from '../../core/models';
import { BorradorSolicitudService } from '../../core/services/borrador-solicitud.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { DisponibilidadService } from '../../core/services/disponibilidad.service';
import { sumarDias } from '../../core/utils/fechas';
import { EstadoVacioComponent } from '../../shared/components/estado-vacio.component';
import { MigasPanComponent } from '../../shared/components/migas-pan.component';
import { FechaAsesoriaPipe } from '../../shared/pipes/fecha-asesoria.pipe';

/** P4. Disponibilidad del profesor (paso 2 de 4). */
@Component({
  selector: 'app-disponibilidad-profesor',
  imports: [RouterLink, MatIconModule, EstadoVacioComponent, MigasPanComponent, FechaAsesoriaPipe],
  templateUrl: './disponibilidad-profesor.page.html',
})
export class DisponibilidadProfesorPage {
  protected readonly modalidades = textoModalidades;
  private readonly catalogo = inject(CatalogoService);
  private readonly disponibilidad = inject(DisponibilidadService);
  private readonly router = inject(Router);
  protected readonly borrador = inject(BorradorSolicitudService);

  /** Parámetro de ruta :id */
  readonly id = input.required<string>();
  /** Término de búsqueda original (?q=), para volver a la lista. */
  readonly q = input('', { transform: (v: string | undefined) => v ?? '' });

  protected readonly semana = signal(0);
  protected readonly profesor = computed(() => this.catalogo.profesorPorId(this.id()));
  protected readonly dias = computed(() => {
    const p = this.profesor();
    return p ? this.disponibilidad.semana(p, this.semana()) : [];
  });
  protected readonly hayHorarios = computed(() => this.dias().some((d) => d.horarios.length));
  protected readonly rangoSemana = computed(() => {
    const lunes = this.disponibilidad.semanas[this.semana()];
    return { inicio: `${lunes}T00:00`, fin: `${sumarDias(lunes, 4)}T00:00` };
  });
  protected readonly totalSemanas = this.disponibilidad.semanas.length;

  /** Horario elegido para este profesor (ignora selecciones hechas con otro docente). */
  protected readonly seleccionado = computed(() =>
    this.borrador.profesorId() === this.id() ? this.borrador.fechaHora() : '',
  );

  protected elegir(h: Horario): void {
    if (h.estado !== 'disponible') return;
    const p = this.profesor()!;
    // Si se entró directo por URL (o desde otro docente), se inicia el borrador con este profesor.
    if (this.borrador.profesorId() !== p.id) {
      this.borrador.iniciar(p.id, this.catalogo.materiaParaSolicitud(p, this.q()));
    }
    this.borrador.fechaHora.set(h.fechaHora);
  }

  protected continuar(): void {
    this.router.navigate(['/estudiante/solicitudes/nueva']);
  }

  protected etiquetaHorario(h: Horario): string {
    return h.estado === 'disponible' ? 'Disponible' : h.estado === 'ocupado' ? 'Ocupado' : 'Pasado';
  }
}
