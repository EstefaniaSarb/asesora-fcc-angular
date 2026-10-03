import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AvisoService } from '../../core/services/aviso.service';
import { BorradorSolicitudService } from '../../core/services/borrador-solicitud.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { SolicitudService } from '../../core/services/solicitud.service';
import { aFecha } from '../../core/utils/fechas';
import { AccionesSolicitudService } from '../../shared/acciones-solicitud.service';
import { ChipEstadoComponent } from '../../shared/components/chip-estado.component';
import { EstadoVacioComponent } from '../../shared/components/estado-vacio.component';
import { MigasPanComponent } from '../../shared/components/migas-pan.component';
import { FechaAsesoriaPipe } from '../../shared/pipes/fecha-asesoria.pipe';

/** P6. Estado de una solicitud: datos, acciones según el estado e historial. */
@Component({
  selector: 'app-detalle-solicitud',
  imports: [RouterLink, MatIconModule, ChipEstadoComponent, EstadoVacioComponent, MigasPanComponent, FechaAsesoriaPipe],
  templateUrl: './detalle-solicitud.page.html',
})
export class DetalleSolicitudPage {
  private readonly solicitudes = inject(SolicitudService);
  private readonly catalogo = inject(CatalogoService);
  private readonly borrador = inject(BorradorSolicitudService);
  private readonly acciones = inject(AccionesSolicitudService);
  private readonly aviso = inject(AvisoService);
  private readonly router = inject(Router);

  /** Parámetro de ruta :folio */
  readonly folio = input.required<string>();

  protected readonly solicitud = computed(() => this.solicitudes.delEstudiante().find((s) => s.folio === this.folio()));
  protected readonly profesor = computed(() => {
    const s = this.solicitud();
    return s ? this.catalogo.profesorPorId(s.profesorId) : undefined;
  });

  protected cancelar(): void {
    this.acciones.ejecutar('cancelar', this.solicitud()!);
  }

  protected responder(aceptada: boolean): void {
    this.solicitudes.responderPropuesta(this.folio(), aceptada);
    this.aviso.exito(aceptada ? 'Nuevo horario confirmado.' : 'Propuesta rechazada; la solicitud se canceló.');
  }

  /** Flujo A1: después de un rechazo, otro horario con el mismo docente. */
  protected elegirOtroHorario(): void {
    const s = this.solicitud()!;
    this.borrador.limpiar();
    this.borrador.iniciar(s.profesorId, s.materia, s.tema);
    this.borrador.descripcion.set(s.descripcion);
    this.router.navigate(['/estudiante/profesores', s.profesorId, 'disponibilidad']);
  }

  /** Flujo A1: buscar otro docente de la misma materia. */
  protected buscarOtroDocente(): void {
    this.router.navigate(['/estudiante/profesores'], { queryParams: { q: this.solicitud()!.materia } });
  }

  /** Descarga un archivo .ics para agregar la asesoría al calendario. */
  protected agregarACalendario(): void {
    const s = this.solicitud()!;
    const inicio = aFecha(s.fechaHora);
    const fin = new Date(inicio.getTime() + 45 * 60000);
    const f = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AsesoraFCC//ES', 'BEGIN:VEVENT',
      `UID:${s.folio}@asesorafcc`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(inicio)}`, `DTEND:${f(fin)}`,
      `SUMMARY:Asesoría: ${s.tema}`, `LOCATION:${s.ubicacion}`, `DESCRIPTION:${s.materia} con ${this.profesor()?.nombre}. Folio ${s.folio}`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${s.folio}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    this.aviso.exito('Se descargó el evento para tu calendario.');
  }
}
