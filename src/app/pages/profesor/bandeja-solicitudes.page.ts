import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EstadoSolicitud, Solicitud } from '../../core/models';
import { AvisoService } from '../../core/services/aviso.service';
import { SolicitudService } from '../../core/services/solicitud.service';
import { normalizar } from '../../core/utils/fechas';
import { AccionesSolicitudService } from '../../shared/acciones-solicitud.service';
import { TipoConfirmacion } from '../../shared/components/dialogo-confirmacion.component';
import { ChipEstadoComponent } from '../../shared/components/chip-estado.component';
import { EstadoVacioComponent } from '../../shared/components/estado-vacio.component';
import { TituloPaginaComponent } from '../../shared/components/titulo-pagina.component';
import { FechaAsesoriaPipe } from '../../shared/pipes/fecha-asesoria.pipe';
import { InicialesPipe } from '../../shared/pipes/iniciales.pipe';

type Pestana = 'Por responder' | 'Próximas' | 'Historial';

/** P8. Gestión de solicitudes del profesor (bandeja + detalle). */
@Component({
  selector: 'app-bandeja-solicitudes',
  imports: [FormsModule, MatIconModule, ChipEstadoComponent, EstadoVacioComponent, TituloPaginaComponent, FechaAsesoriaPipe, InicialesPipe],
  templateUrl: './bandeja-solicitudes.page.html',
})
export class BandejaSolicitudesPage {
  protected readonly solicitudes = inject(SolicitudService);
  private readonly acciones = inject(AccionesSolicitudService);
  private readonly aviso = inject(AvisoService);

  protected readonly pestanas: Pestana[] = ['Por responder', 'Próximas', 'Historial'];
  private readonly estadosDe: Record<Pestana, EstadoSolicitud[]> = {
    'Por responder': ['Pendiente'],
    'Próximas': ['Confirmada', 'Reprogramación propuesta'],
    'Historial': ['Completada', 'Inasistencia', 'Rechazada', 'Cancelada'],
  };

  protected readonly pestana = signal<Pestana>('Por responder');
  protected readonly busqueda = signal('');
  protected readonly materia = signal('Todas las materias');
  private readonly folioSeleccionado = signal('');

  protected readonly materias = computed(() => Array.from(new Set(this.solicitudes.delProfesor().map((s) => s.materia))));

  protected readonly visibles = computed(() => {
    const q = normalizar(this.busqueda());
    return this.solicitudes
      .delProfesor()
      .filter((s) => this.estadosDe[this.pestana()].includes(s.estado))
      .filter((s) => normalizar(`${s.estudiante.nombre} ${s.tema} ${s.folio}`).includes(q))
      .filter((s) => this.materia() === 'Todas las materias' || s.materia === this.materia());
  });

  /**
   * El detalle se lee del estado global por folio: si un diálogo cambia el
   * estado, el panel se actualiza solo. Si la solicitud sale de la pestaña,
   * se selecciona la primera visible.
   */
  protected readonly seleccionada = computed<Solicitud | undefined>(
    () => this.visibles().find((s) => s.folio === this.folioSeleccionado()) ?? this.visibles()[0],
  );

  protected readonly previas = computed(() => {
    const s = this.seleccionada();
    return s ? this.solicitudes.solicitudesPrevias(s) : 0;
  });

  protected cuantas(p: Pestana): number {
    return this.solicitudes.delProfesor().filter((s) => this.estadosDe[p].includes(s.estado)).length;
  }

  protected seleccionar(s: Solicitud): void {
    this.folioSeleccionado.set(s.folio);
    // En móvil el detalle queda debajo de la lista: se lleva la vista hacia él.
    if (window.innerWidth < 768) setTimeout(() => document.getElementById('detalle-solicitud')?.scrollIntoView({ behavior: 'smooth' }));
  }

  protected aceptar(s: Solicitud): void {
    this.solicitudes.aceptar(s.folio);
    this.aviso.exito(`Solicitud aceptada. Se notificó a ${s.estudiante.nombre}.`);
  }

  protected verArchivo(): void {
    this.aviso.exito('Vista previa de archivos disponible al conectar con el almacenamiento institucional.');
  }

  protected accion(tipo: TipoConfirmacion, s: Solicitud): void {
    this.acciones.ejecutar(tipo, s);
  }
}
