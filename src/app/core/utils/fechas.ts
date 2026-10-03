/**
 * Utilidades de fecha para el prototipo.
 * Se trabaja con cadenas ISO locales (sin zona horaria), por ejemplo
 * "2026-10-12T10:00", que el navegador interpreta en la hora local
 * (Ciudad de México en el contexto de la aplicación).
 */
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export type FormatoFecha = 'completa' | 'corta' | 'hora' | 'dia' | 'mes' | 'encabezadoDia' | 'larga' | 'rango';

const dos = (n: number) => String(n).padStart(2, '0');
const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function aFecha(iso: string): Date {
  return new Date(iso);
}

export function aIso(fecha: Date): string {
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}T${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;
}

export function formatearFecha(iso: string | undefined | null, formato: FormatoFecha = 'completa'): string {
  if (!iso) return '';
  const f = aFecha(iso);
  const hora = `${dos(f.getHours())}:${dos(f.getMinutes())}`;
  switch (formato) {
    case 'completa': return `${DIAS_CORTOS[f.getDay()]} ${f.getDate()} ${MESES_CORTOS[f.getMonth()]}, ${hora} h`;
    case 'corta': return `${DIAS_CORTOS[f.getDay()]} ${f.getDate()} ${MESES_CORTOS[f.getMonth()]}`;
    case 'hora': return hora;
    case 'dia': return String(f.getDate());
    case 'mes': return MESES_CORTOS[f.getMonth()].toUpperCase();
    case 'encabezadoDia': return `${mayuscula(DIAS_CORTOS[f.getDay()])} ${f.getDate()}`;
    case 'larga': return `${mayuscula(DIAS[f.getDay()])}, ${f.getDate()} de ${MESES[f.getMonth()]}`;
    case 'rango': return `${f.getDate()} ${MESES_CORTOS[f.getMonth()]}`;
  }
}

export function mismoDia(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

/** Suma días a una fecha ISO (solo la parte de fecha, YYYY-MM-DD). */
export function sumarDias(fechaIso: string, dias: number): string {
  const f = aFecha(fechaIso.length === 10 ? `${fechaIso}T00:00` : fechaIso);
  f.setDate(f.getDate() + dias);
  return aIso(f).slice(0, 10);
}

export function iniciales(nombre: string): string {
  return nombre
    .replace(/^(Dra?|Mtr[oa])\.\s*/, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

/** Normaliza texto para búsquedas: minúsculas y sin acentos. */
export function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
}

/** Primera letra en mayúscula: "recursividad" → "Recursividad". */
export function capitalizar(texto: string): string {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto;
}

/** Texto de modalidades: ["Presencial", "En línea"] → "Presencial y en línea". */
export function textoModalidades(modalidades: string[]): string {
  return modalidades.length > 1 ? `${modalidades[0]} y ${modalidades.slice(1).join(', ').toLowerCase()}` : modalidades[0] ?? '';
}
