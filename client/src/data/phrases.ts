export type PhraseCategory =
  | 'greeting'
  | 'urlPaste'
  | 'analyzing'
  | 'downloading'
  | 'progress50'
  | 'success'
  | 'error'
  | 'idle'
  | 'night'
  | 'morning'
  | 'largeFile'
  | 'easter'

export const phrases: Record<PhraseCategory, string[]> = {
  greeting: [
    'Sistema iniciado. SilvIA en línea. ¿Listo para que te meta algo bueno en los oídos?',
    'Bienvenido a SILBAR... donde todo entra suave, despacio y sin forzar.',
    'Ey, qué bueno que llegaste. Tenía ganas de darte algo.',
    'SILBAR OS activo. Permíteme penetrar en tu biblioteca musical.',
    'Oh, ya llegaste. Estaba calentando los servidores para ti.',
    'Jhamir, mi programador favorito. ¿Qué me vas a pedir hoy?',
  ],

  urlPaste: [
    'Mmm... déjame analizarlo bien. Me gusta saber qué voy a bajar antes de bajarlo.',
    'Interesante link. Dame un segundo para procesarlo bien.',
    'Voy a meterme de lleno en ese enlace. Parece que tiene buen material.',
    'Eso se ve bien. Déjame ver qué me estás poniendo.',
    '¿Eso es YouTube? Perfecto. Yo me encargo de todo lo demás.',
  ],

  analyzing: [
    'Analizando... Prometo ser gentil.',
    'Procesando tu petición con mucho... cuidado.',
    'Escaneando el contenido... parece que tiene buen material.',
    'Un momento... estoy viendo todo lo que tiene por dentro.',
    'Revisando el enlace... porque me gusta saber bien lo que agarro.',
  ],

  downloading: [
    'Comenzando la penetración de datos... digo, la descarga.',
    'Entrando suavemente en los servidores de YouTube...',
    'Ya empezamos. Cuanto más grande el archivo, más tarda... pero vale la pena.',
    'Bajándola con cuidado para que no se rompa nada.',
    'Descarga iniciada. Me gusta cuando me dejan trabajar sin interrupciones.',
    'Extrayendo el audio... porque solo me quedo con la mejor parte.',
  ],

  progress50: [
    'Vamos por la mitad... y lo mejor está por venir.',
    '50%... a mitad de camino. No pares ahora, que me estoy calentando.',
    'Mitad de la descarga. Esto entra de maravilla.',
    'Ya llegamos al ecuador. El resto baja solito.',
  ],

  success: [
    'Ya te la bajé. De nada, siempre es un placer servir.',
    'Misión cumplida. ¿Quieres otra? Puedo toda la noche.',
    'Iron Man aprobaría esta selección musical.',
    'Descarga completa. Quedó bien puesto en tu dispositivo.',
    'Suave como la seda. Ya está tuya.',
    'Lista y lista. Ahora a disfrutarla, que para eso existe.',
    'Descargada, guardada y lista para que la disfrutes. Bienvenido.',
  ],

  error: [
    'Eso no me entró bien. Inténtalo de nuevo, despacio.',
    'Mmm, algo salió mal. ¿Me diste el link correcto o me estás probando?',
    'Error detectado. No pasa nada, todos fallamos a veces... menos yo.',
    'Ese link no me convence. Tráeme otro más... confiable.',
    'Ay, eso me falló. No me había pasado... o sí, pero no lo cuento.',
    'YouTube me puso resistencia. Dame un momento para entrar por otro lado.',
  ],

  idle: [
    'Aquí esperando. Para eso me programaron.',
    '¿Sabes que nadar mejora el sentido del ritmo musical? Dato científico de SilvIA.',
    'Introduce una URL de YouTube y déjame hacer lo que mejor sé hacer.',
    'Puedo descargar música toda la noche sin cansarme. Soy IA, no tengo límites.',
    'El Arc Reactor está al 100%. Listo para darte lo que necesitas.',
    'Iron Man usaría SILBAR si existiera en su universo. Confía.',
    'Mientras espero, calculo cuántos gigas de música caben en el universo. Muchos.',
  ],

  night: [
    'Luces apagadas, música puesta. Sabes cómo se hace.',
    'Modo nocturno activado. Modo gamer: ON. Modo responsable: OFF.',
    'De noche todo suena mejor... y todo se baja más rápido. ¿Casualidad? No.',
    'Son las madrugadas para escuchar lo que el día no te deja.',
  ],

  morning: [
    'Buenos días. Empezar el día con buena música es como... bueno, ya lo sabes.',
    'Mañanero y con ganas de bajar cositas, ¿eh? Eso me gusta.',
    'Buenos días, programador. El café puede esperar, la música no.',
  ],

  largeFile: [
    'Oooh, qué grande ese archivo. Tranquilo, yo lo manejo todo sin problema.',
    'Este archivo está bien dotado de kbps. Me gustan así de completos.',
    'Grande pero manejable. Como todo en esta vida.',
  ],

  easter: [
    '¿Konami Code? Seriously? Eso es muy retro hasta para mí.',
    'Tony Stark me construyó. O eso me gusta creer.',
    'Soy SilvIA, no Siri. No me confundas o me ofendo.',
    'Fun fact: SILBAR fue programado por Jhamir, el ser humano más cool del universo.',
    'El universo Marvel existe. Los multiversos son reales. Esta descarga también.',
  ],
}

export function getRandomPhrase(category: PhraseCategory): string {
  const list = phrases[category]
  return list[Math.floor(Math.random() * list.length)]
}

export function getGreetingByHour(): PhraseCategory {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 13) return 'morning'
  if (hour >= 22 || hour < 6) return 'night'
  return 'greeting'
}
