import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Modalidad } from '../../core/models';
import { AvisoService } from '../../core/services/aviso.service';
import { BorradorSolicitudService } from '../../core/services/borrador-solicitud.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { SolicitudService } from '../../core/services/solicitud.service';
import { MigasPanComponent } from '../../shared/components/migas-pan.component';
import { TituloPaginaComponent } from '../../shared/components/titulo-pagina.component';
import { FechaAsesoriaPipe } from '../../shared/pipes/fecha-asesoria.pipe';

type Vista = 'detalles' | 'confirmar' | 'exito' | 'conflicto';

/** P5. Detalle y confirmación de la solicitud (pasos 3 y 4 de 4). */
@Component({
  selector: 'app-nueva-solicitud',
  imports: [ReactiveFormsModule, RouterLink, MatIconModule, MigasPanComponent, TituloPaginaComponent, FechaAsesoriaPipe],
  templateUrl: './nueva-solicitud.page.html',
})
export class NuevaSolicitudPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly solicitudes = inject(SolicitudService);
  private readonly aviso = inject(AvisoService);
  private readonly catalogo = inject(CatalogoService);
  protected readonly borrador = inject(BorradorSolicitudService);

  protected readonly profesor = computed(() => this.catalogo.profesorPorId(this.borrador.profesorId())!);
  protected readonly vista = signal<Vista>('detalles');
  protected readonly folio = signal('');
  protected readonly profesorEnviado = signal('');
  protected readonly enviado = signal(false);

  protected readonly form = this.fb.group({
    tema: [this.borrador.tema(), [Validators.required, Validators.maxLength(80)]],
    descripcion: [this.borrador.descripcion(), [Validators.required, Validators.minLength(15), Validators.maxLength(500)]],
    modalidad: [(this.borrador.modalidad() || this.profesor().modalidades[0]) as Modalidad, Validators.required],
  });

  protected readonly descripcionLargo = toSignal(this.form.controls.descripcion.valueChanges, { initialValue: this.form.controls.descripcion.value });

  protected archivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const f = input.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      this.aviso.error('El archivo supera los 10 MB permitidos.');
      input.value = '';
      return;
    }
    const tamano = f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB`;
    this.borrador.adjunto.set({ nombre: f.name, tamano });
  }

  protected revisar(): void {
    this.enviado.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardarBorrador();
    this.vista.set('confirmar');
    window.scrollTo({ top: 0 });
  }

  protected confirmar(): void {
    const v = this.form.getRawValue();
    const resultado = this.solicitudes.crear({
      materia: this.borrador.materia(),
      tema: v.tema.trim(),
      descripcion: v.descripcion.trim(),
      modalidad: v.modalidad,
      profesorId: this.borrador.profesorId(),
      fechaHora: this.borrador.fechaHora(),
      adjunto: this.borrador.adjunto(),
    });
    if (resultado.ok) {
      this.folio.set(resultado.folio);
      this.profesorEnviado.set(this.profesor().nombre);
      this.vista.set('exito');
      this.borrador.limpiar();
    } else {
      // Se conserva lo capturado y se pide otro horario (flujo A4).
      this.guardarBorrador();
      this.borrador.fechaHora.set('');
      this.vista.set('conflicto');
    }
    window.scrollTo({ top: 0 });
  }

  protected elegirOtroHorario(): void {
    this.router.navigate(['/estudiante/profesores', this.profesor().id, 'disponibilidad']);
  }

  protected regresar(): void {
    if (this.vista() === 'confirmar') {
      this.vista.set('detalles');
    } else {
      this.guardarBorrador();
      this.router.navigate(['/estudiante/profesores', this.profesor().id, 'disponibilidad']);
    }
  }

  protected async copiarFolio(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.folio());
      this.aviso.exito('Folio copiado al portapapeles.');
    } catch {
      this.aviso.error('No fue posible copiar el folio.');
    }
  }

  private guardarBorrador(): void {
    const v = this.form.getRawValue();
    this.borrador.tema.set(v.tema);
    this.borrador.descripcion.set(v.descripcion);
    this.borrador.modalidad.set(v.modalidad);
  }
}
