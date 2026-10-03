# AsesoraFCC | SPA en Angular 20.3.14

Prototipo funcional de una aplicación de página única (SPA) para solicitar y gestionar asesorías académicas en la Facultad de Ciencias de la Computación (BUAP). Es la conversión a Angular del prototipo generado en **Figma Make** (que produce React), con las correcciones de los prompts de revisión ya aplicadas.

Diplomado en Ciencias de la Computación · Dr. Luis Yael Méndez Sánchez · FCC-BUAP

---

## Requisitos

- Node.js 20.19 o superior (LTS)
- Angular CLI 20.3.14: `npm i -g @angular/cli@20.3.14`

## Ejecutar

```bash
npm install
ng serve -o
```

La aplicación abre en `http://localhost:4200/#/acceso`. No requiere conexión a internet: las fuentes Roboto y Material Symbols se instalan como paquetes npm.

Compilación de producción: `ng build` (resultado en `dist/asesora-fcc/browser`).
Compilación para publicar en cualquier carpeta o servidor estático: `npm run build:demo`.

---

## Tecnologías y decisiones

| Elemento | Uso en el proyecto |
|---|---|
| **Angular 20.3.14** | Componentes *standalone*, signals (`signal`, `computed`, `effect`), `input()`/`output()`, control de flujo `@if`/`@for`/`@switch`, `inject()`. |
| **Router** | Carga diferida (`loadComponent`), rutas con `#` (`withHashLocation`, igual que Figma Make), parámetros como `input()` (`withComponentInputBinding`), *guards* funcionales. |
| **Angular Material 20** | `MatDialog` (confirmaciones), `MatSnackBar` (avisos), `MatMenu` (menú de perfil), `MatBottomSheet` (filtros en móvil), `MatSlideToggle`, `MatTooltip`, `MatIcon` con Material Symbols. Tema con la paleta BUAP generado con `ng g @angular/material:theme-color`. |
| **Bootstrap 5.3** | Solo **retícula y utilidades** (`bootstrap-grid.css` y `bootstrap-utilities.css`): `row`, `col-*`, `g-*`, `d-lg-none`, `w-100`, etc. No se cargan sus componentes porque el diseño de Figma define clases con los mismos nombres (`.btn`, `.card`, `.modal`, `.toast`, `.breadcrumb`) y habría colisiones. |
| **Formularios** | Reactivos (`NonNullableFormBuilder`, `Validators`) en la nueva solicitud; `ngModel` con signals en filtros. |
| **Estilos** | El CSS que generó Figma Make se conservó y se dividió en parciales SCSS por sección (`src/styles/`). Los ajustes de integración están en `src/styles/_integracion.scss`. |

### Convención de nombres de Angular 20

Desde Angular 20 el CLI ya no agrega sufijos (`ng g s materia` crea la clase `Materia`, que choca con la interfaz del modelo). En este proyecto se usó la opción `--type`:

```bash
ng g s core/services/solicitud --type=service   # solicitud.service.ts → SolicitudService
ng g c pages/estudiante/materias --type=page     # materias.page.ts   → MateriasPage
```

---

## Estructura

```
src/app/
├─ core/
│  ├─ models/            Interfaces: Solicitud, Profesor, Materia, Notificacion, tipos
│  ├─ data/              Datos simulados (en producción vendrían de una API REST)
│  ├─ services/          Estado y lógica con signals
│  │  ├─ sesion.service.ts               Rol activo y usuario del prototipo
│  │  ├─ catalogo.service.ts             Materias y profesores
│  │  ├─ solicitud.service.ts            Única fuente de verdad de las solicitudes
│  │  ├─ disponibilidad.service.ts       Horarios libres/ocupados calculados
│  │  ├─ notificacion.service.ts         Centro de notificaciones
│  │  ├─ borrador-solicitud.service.ts   Datos del flujo de solicitud paso a paso
│  │  ├─ reloj.service.ts                "Hoy" fijo para una demostración repetible
│  │  └─ aviso.service.ts                MatSnackBar
│  ├─ guards/            sesionGuard, rolGuard, borradorGuard
│  └─ utils/             Fechas en español, iniciales, normalización de texto
├─ shared/
│  ├─ components/        ChipEstado, EstadoVacio, MigasPan, TituloPagina, TarjetaProfesor,
│  │                     Carga, DialogoConfirmacion
│  ├─ pipes/             fechaAsesoria, iniciales
│  └─ acciones-solicitud.service.ts   Abre el diálogo y aplica la acción
├─ layout/
│  └─ marco-aplicacion.component.ts   Barra superior, menú lateral y navegación móvil
├─ pages/                Las 12 pantallas (P0 a P11)
├─ app.routes.ts
└─ app.config.ts
```

## Pantallas y rutas

| Pantalla | Componente | Ruta |
|---|---|---|
| P0 Acceso | `AccesoPage` | `/acceso` |
| P1 Inicio del estudiante | `InicioEstudiantePage` | `/estudiante/inicio` |
| P2 Selección de materia o tema | `MateriasPage` | `/estudiante/materias` |
| P3 Profesores disponibles | `ProfesoresPage` | `/estudiante/profesores?q=` |
| P4 Disponibilidad del profesor | `DisponibilidadProfesorPage` | `/estudiante/profesores/:id/disponibilidad` |
| P5 Detalle y confirmación | `NuevaSolicitudPage` | `/estudiante/solicitudes/nueva` |
| P6 Mis solicitudes / Estado | `MisSolicitudesPage`, `DetalleSolicitudPage` | `/estudiante/solicitudes`, `/estudiante/solicitudes/:folio` |
| P7 Panel del profesor | `PanelProfesorPage` | `/profesor/panel` |
| P8 Gestión de solicitudes | `BandejaSolicitudesPage` | `/profesor/solicitudes` |
| P9 Gestión de disponibilidad | `GestionDisponibilidadPage` | `/profesor/disponibilidad` |
| P10 Notificaciones | `NotificacionesPage` | `/notificaciones` |
| P11 Perfil y preferencias | `PerfilPage` | `/perfil` |

---

## Guion de demostración (todos los flujos)

1. **Acceso como Estudiante** → buscar `recursividad` → **Dra. Ana Torres Ruiz**.
2. **A4 Conflicto:** elegir **mar 13 oct, 12:00** y enviar. Aparece "Este horario acaba de ocuparse"; se conservan tema y descripción.
3. Elegir otro horario y enviar → éxito con folio.
4. Menú de perfil → **Cambiar de rol** (Profesora). La campana y la bandeja muestran la nueva solicitud.
5. **A2 Reprogramación:** en la bandeja, "Proponer otro horario". Volver a Estudiante → notificación → aceptar o rechazar la propuesta.
6. **A1 Rechazo:** rechazar otra solicitud con motivo (obligatorio, mínimo 10 caracteres).
7. **A3 Cancelación:** como estudiante, cancelar una solicitud Pendiente o Confirmada; el horario queda libre.
8. **A5 Cierre:** como profesora, en el panel o en la bandeja, marcar "Completada" o "Inasistencia".

El "hoy" del prototipo es el **lunes 12 de octubre de 2026, 09:25 h** (`FECHA_REFERENCIA` en `core/data/datos-simulados.ts`).

---

## Correcciones respecto al prototipo de Figma Make

- La bandeja docente inicia con solicitudes de varios estudiantes (Pendiente y Reprogramación propuesta).
- Iniciales, solicitudes previas, adjuntos, contadores y fechas se calculan a partir de los datos.
- Profesores filtrados por materia o tema; filtros de modalidad, "Hoy", "Esta semana" y orden funcionales.
- En pantallas menores a 992 px los filtros se abren en un panel inferior.
- Migas de pan navegables y estado vacío para folios inexistentes.
- Horarios ocupados calculados a partir de las solicitudes activas (al cancelar, el horario se libera).
- Reprogramación con selección de horarios libres reales, en lugar de texto libre.
- Descarga de archivo `.ics` para agregar la asesoría al calendario.

## Ideas para siguientes sesiones

- Conectar los servicios a una API REST con `HttpClient` (por ejemplo, JSON Server).
- Que la disponibilidad editada por la profesora (P9) alimente los horarios que ve el estudiante.
- Persistir la sesión y agregar autenticación real.
- Pruebas unitarias de `SolicitudService` y `DisponibilidadService`.
