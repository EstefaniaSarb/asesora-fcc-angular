import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { Solicitud } from '../core/models';
import { AvisoService } from '../core/services/aviso.service';
import { CatalogoService } from '../core/services/catalogo.service';
import { DisponibilidadService } from '../core/services/disponibilidad.service';
import { SolicitudService } from '../core/services/solicitud.service';
import {
  DatosConfirmacion,
  DialogoConfirmacionComponent,
  ResultadoConfirmacion,
  TipoConfirmacion,
} from './components/dialogo-confirmacion.component';

/**
 * Orquesta las acciones que requieren confirmación: abre el diálogo,
 * aplica el cambio en SolicitudService y muestra el aviso correspondiente.
 */
@Injectable({ providedIn: 'root' })
export class AccionesSolicitudService {
  private readonly dialog = inject(MatDialog);
  private readonly solicitudes = inject(SolicitudService);
  private readonly catalogo = inject(CatalogoService);
  private readonly disponibilidad = inject(DisponibilidadService);
  private readonly aviso = inject(AvisoService);

  async ejecutar(tipo: TipoConfirmacion, solicitud: Solicitud): Promise<boolean> {
    const datos: DatosConfirmacion = { tipo, solicitud };
    if (tipo === 'reprogramar') {
      const profesor = this.catalogo.profesorPorId(solicitud.profesorId)!;
      datos.horariosLibres = this.disponibilidad.libres(profesor, solicitud.folio).filter((h) => h !== solicitud.fechaHora);
    }
    const ref = this.dialog.open<DialogoConfirmacionComponent, DatosConfirmacion, ResultadoConfirmacion>(
      DialogoConfirmacionComponent,
      { data: datos, panelClass: 'asesora-dialog', width: '500px', maxWidth: 'calc(100vw - 32px)', autoFocus: 'first-tabbable', ariaLabelledBy: 'dialogo-titulo' },
    );
    const resultado = await firstValueFrom(ref.afterClosed());
    if (!resultado) return false;

    switch (tipo) {
      case 'cancelar':
        this.solicitudes.cancelar(solicitud.folio);
        this.aviso.exito('Solicitud cancelada. El horario quedó libre.');
        break;
      case 'rechazar':
        this.solicitudes.rechazar(solicitud.folio, resultado.motivo!);
        this.aviso.exito('Solicitud rechazada. Se notificó al estudiante.');
        break;
      case 'reprogramar':
        this.solicitudes.proponerHorario(solicitud.folio, resultado.horario!);
        this.aviso.exito('Nuevo horario propuesto.');
        break;
      case 'completar':
        this.solicitudes.completar(solicitud.folio);
        this.aviso.exito('Asesoría marcada como completada.');
        break;
      case 'inasistencia':
        this.solicitudes.registrarInasistencia(solicitud.folio);
        this.aviso.exito('Inasistencia registrada.');
        break;
    }
    return true;
  }
}
