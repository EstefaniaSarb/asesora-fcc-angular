import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Solicitud } from '../../core/models';
import { DisponibilidadService } from '../../core/services/disponibilidad.service';
import { RelojService } from '../../core/services/reloj.service';
import { SesionService } from '../../core/services/sesion.service';
import { SolicitudService } from '../../core/services/solicitud.service';
import { mismoDia } from '../../core/utils/fechas';
import { AccionesSolicitudService } from '../../shared/acciones-solicitud.service';
import { ChipEstadoComponent } from '../../shared/components/chip-estado.component';
import { EstadoVacioComponent } from '../../shared/components/estado-vacio.component';
import { FechaAsesoriaPipe } from '../../shared/pipes/fecha-asesoria.pipe';

/** P7. Panel del profesor. */
@Component({
  selector: 'app-panel-profesor',
  imports: [RouterLink, MatIconModule, ChipEstadoComponent, EstadoVacioComponent, FechaAsesoriaPipe],
  templateUrl: './panel-profesor.page.html',
})
export class PanelProfesorPage {
  private readonly solicitudes = inject(SolicitudService);
  private readonly disponibilidad = inject(DisponibilidadService);
  private readonly acciones = inject(AccionesSolicitudService);
  protected readonly reloj = inject(RelojService);
  protected readonly sesion = inject(SesionService);

  protected readonly pendientes = computed(() => this.solicitudes.delProfesor().filter((s) => s.estado === 'Pendiente'));
  protected readonly confirmadas = computed(() => this.solicitudes.delProfesor().filter((s) => s.estado === 'Confirmada'));
  protected readonly hoy = computed(() => this.confirmadas().filter((s) => mismoDia(s.fechaHora, this.reloj.hoy)));
  protected readonly semana = computed(() =>
    this.solicitudes.delProfesor().filter((s) => ['Pendiente', 'Confirmada'].includes(s.estado) && this.disponibilidad.esEstaSemana(s.fechaHora)),
  );
  /** "Dra. Ana Torres Ruiz" → "Buen día, Dra. Torres" */
  protected readonly saludo = (() => {
    const [titulo, , apellido] = this.sesion.profesor.nombre.split(' ');
    return `Buen día, ${titulo} ${apellido}`;
  })();

  protected completar(s: Solicitud): void {
    this.acciones.ejecutar('completar', s);
  }

  protected inasistencia(s: Solicitud): void {
    this.acciones.ejecutar('inasistencia', s);
  }
}
