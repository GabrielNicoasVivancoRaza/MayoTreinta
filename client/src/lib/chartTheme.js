// Paleta categorica validada (ver skill de dataviz): orden fijo, nunca ciclar hues. Se deja tal
// cual para no perder la garantia de distincion por daltonismo entre series.
export const CATEGORICAL = [
  '#2a78d6', // 1 blue
  '#eb6834', // 2 orange
  '#1baf7a', // 3 aqua
  '#eda100', // 4 yellow
  '#e87ba4', // 5 magenta
  '#008300', // 6 green
  '#4a3aa7', // 7 violet
  '#e34948', // 8 red
];

// Para series de un solo color (lineas, barras de una sola metrica) se usa el rosa de marca:
// al ser un solo hue no hay riesgo de confusion por daltonismo.
export const SEQUENTIAL_ACCENT = '#D42E5E';

export const STATUS = {
  good: '#15803D',
  warning: '#B45309',
  serious: '#C2410C',
  critical: '#DC2626',
};

// Tonos calidos (crema/negro), consistentes con la paleta "gray" de tailwind.config.js
export const CHROME = {
  surface: '#FFFFFF',
  textPrimary: '#332F26',
  textSecondary: '#6B6355',
  textMuted: '#8C8068',
  gridline: '#E8DFC8',
  axis: '#D8CBAE',
};
