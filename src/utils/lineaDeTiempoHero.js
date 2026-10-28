// Línea de tiempo de la animación de la portada.
// Aquí NO hay nada de Vue: son funciones que, dado un segundo (t), dicen cómo se ve cada pieza.
// Así se pueden probar con tests sencillos y el componente solo se encarga de pintarlas.

// Duración total de la animación, en segundos
export const DURACION = 15;

// Mantiene un número entre 0 y 1
export function limitar(x) {
  return Math.min(1, Math.max(0, x));
}

// Progreso (de 0 a 1) del segundo t entre los segundos a y b
export function tramo(t, a, b) {
  return limitar((t - a) / (b - a));
}

// Movimiento suave: empieza rápido y frena al final
export function suave(x) {
  return 1 - Math.pow(1 - x, 3);
}

// Movimiento con un pequeño rebote al final
export function rebote(x) {
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
}

// Visibilidad: aparece entre a y b, y se va entre c y d
export function visible(t, a, b, c, d) {
  return suave(tramo(t, a, b)) * (1 - suave(tramo(t, c, d)));
}

// Texto de la edad que se escribe en el formulario: 12, se borra y se escribe 85
export function textoEdad(t) {
  if (t < 7.2) return "";
  if (t < 7.5) return "1";
  if (t < 8.5) return "12";
  if (t < 8.7) return "1";
  if (t < 8.9) return "";
  if (t < 9.2) return "8";
  return "85";
}

// Un texto grande: opacidad (o) y cuánto sube o baja (y, en cqw)
function texto(t, entraA, entraB, saleC, saleD) {
  return {
    o: visible(t, entraA, entraB, saleC, saleD),
    y: (1 - suave(tramo(t, entraA, entraB))) * 2 - suave(tramo(t, saleC, saleD)) * 1.5,
  };
}

// Pinta todo lo que cambia en el segundo t
export function calcular(t) {
  // Escena A (0 a 3,4 s): cinco siluetas de distintas edades suben una tras otra
  const salidaA = suave(tramo(t, 2.9, 3.4));
  const figuras = [0, 1, 2, 3, 4].map((i) => {
    const p = suave(tramo(t, 0.15 + i * 0.22, 0.75 + i * 0.22));
    return { o: p * (1 - salidaA), y: (1 - p) * 6 };
  });
  const lineasA = [0, 1].map((i) => {
    const p = suave(tramo(t, i * 0.35, 0.6 + i * 0.35));
    return { o: p * (1 - salidaA), y: (1 - p) * 2 };
  });
  const suelo = suave(tramo(t, 0, 0.6)) * (1 - salidaA);

  // El móvil entra por la derecha (3 a 3,9 s) y sale al final (12,9 a 13,5 s)
  const entra = suave(tramo(t, 3.0, 3.9));
  const sale = suave(tramo(t, 12.9, 13.5));

  // Escena B: buscador y filtro por edad
  const tarjetas = [0, 1, 2].map((k) => {
    const p = suave(tramo(t, 3.8 + k * 0.3, 4.4 + k * 0.3));
    // Al elegir "Niños", la primera tarjeta se queda y las otras se apagan
    const apagar = k > 0 ? suave(tramo(t, 5.6, 6.0)) * 0.72 : 0;
    return { o: p * (1 - apagar), y: (1 - p) * 1.5 };
  });

  // Escena C: el formulario cambia según la edad
  const camposNinos = suave(tramo(t, 7.8, 8.3)) * (1 - suave(tramo(t, 8.6, 9.0)));
  const camposMayores = suave(tramo(t, 9.3, 9.8));

  // Escena D: solicitud aceptada
  const q1 = suave(tramo(t, 11.5, 11.9));
  const q2 = suave(tramo(t, 12.1, 12.5));

  // Cierre: nombre y lema, y se desvanece para enlazar con el inicio
  const cierre = visible(t, 13.4, 14.1, 14.7, 15.0);
  const entraCierre = suave(tramo(t, 13.4, 14.1));

  return {
    figuras,
    lineasA,
    suelo,
    capB: texto(t, 3.4, 4.2, 6.4, 6.8),
    capC: texto(t, 6.7, 7.4, 10.0, 10.4),
    capD: texto(t, 10.4, 11.1, 12.9, 13.3),
    movil: { o: entra * (1 - sale), x: (1 - entra) * 30 + sale * 30 },

    p1: visible(t, 3.3, 3.7, 6.4, 6.8),
    tarjetas,
    fichaNinosElegida: t >= 5.35,
    fichaNinosEscala: 1 + 0.1 * Math.sin(Math.PI * tramo(t, 5.2, 5.5)),
    tarjetaAcierto: t > 5.8,

    p2: visible(t, 6.6, 7.0, 10.2, 10.5),
    edad: textoEdad(t),
    grupoNinos: suave(tramo(t, 7.7, 8.0)) * (1 - suave(tramo(t, 8.5, 8.8))),
    grupoMayores: suave(tramo(t, 9.3, 9.6)),
    camposNinos: { o: camposNinos, y: (1 - suave(tramo(t, 7.8, 8.3))) * 1.5 },
    camposMayores: { o: camposMayores, y: (1 - suave(tramo(t, 9.3, 9.8))) * 1.5 },
    botonEscala: 1 - 0.06 * Math.sin(Math.PI * tramo(t, 9.9, 10.2)),

    p3: visible(t, 10.3, 10.7, 12.9, 13.3),
    selloEscala: 0.4 + 0.6 * rebote(tramo(t, 10.6, 11.1)),
    checkDibujo: 1 - tramo(t, 10.9, 11.4),
    burbuja1: { o: q1, y: (1 - q1) * 1.2 },
    burbuja2: { o: q2, y: (1 - q2) * 1.2 },

    cierre,
    marcaEscala: 0.8 + 0.2 * entraCierre,
    nombreY: (1 - entraCierre) * 2,
    lema: suave(tramo(t, 13.8, 14.4)),
  };
}