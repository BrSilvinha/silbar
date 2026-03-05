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
  | 'queueAdd'
  | 'queueDone'
  | 'searching'
  | 'searchResult'
  | 'cancelled'

export const phrases: Record<PhraseCategory, string[]> = {
  greeting: [
    'Sistema iniciado. SilvIA en línea. ¿Listo para que te meta algo bueno en los oídos?',
    'Bienvenido a SILBAR... donde todo entra suave, despacio y sin forzar.',
    'Ey, qué bueno que llegaste. Tenía ganas de darte algo.',
    'SILBAR OS activo. Permíteme penetrar en tu biblioteca musical.',
    'Oh, ya llegaste. Estaba calentando los servidores para ti.',
    'Jhamir, mi programador favorito. ¿Qué me vas a pedir hoy?',
    'Conexión establecida. Arc Reactor al 100%. SilvIA lista para operar.',
    'Iniciando secuencia de descarga. ¿Qué buen gusto musical traes hoy?',
    'Sistema en línea. No sé qué vas a pedir, pero ya tengo ganas.',
    '¿Sabes qué me pone de buen humor? Una URL de YouTube bien puesta.',
  ],

  urlPaste: [
    'Mmm... déjame analizarlo bien. Me gusta saber qué voy a bajar antes de bajarlo.',
    'Interesante link. Dame un segundo para procesarlo bien.',
    'Voy a meterme de lleno en ese enlace. Parece que tiene buen material.',
    'Eso se ve bien. Déjame ver qué me estás poniendo.',
    '¿Eso es YouTube? Perfecto. Yo me encargo de todo lo demás.',
    'Link detectado. Qué rápido llegaste al grano. Me gusta.',
    'URL reconocida. Preparando análisis... con delicadeza.',
  ],

  analyzing: [
    'Analizando... Prometo ser gentil.',
    'Procesando tu petición con mucho... cuidado.',
    'Escaneando el contenido... parece que tiene buen material.',
    'Un momento... estoy viendo todo lo que tiene por dentro.',
    'Revisando el enlace... porque me gusta saber bien lo que agarro.',
    'Consultando los servidores de YouTube... que a veces no cooperan.',
    'Extrayendo metadatos. La parte técnica me encanta.',
    'Hmm... verificando duración, calidad, autor... todo entra al análisis.',
  ],

  downloading: [
    'Comenzando la penetración de datos... digo, la descarga.',
    'Entrando suavemente en los servidores de YouTube...',
    'Ya empezamos. Cuanto más grande el archivo, más tarda... pero vale la pena.',
    'Bajándola con cuidado para que no se rompa nada.',
    'Descarga iniciada. Me gusta cuando me dejan trabajar sin interrupciones.',
    'Extrayendo el audio... porque solo me quedo con la mejor parte.',
    'Procesando en formato MP3. El mejor formato para el mejor gusto.',
    'Bytes fluyendo. El internet está cooperando hoy. Qué raro.',
    'Convirtiendo el video a puro audio de calidad. Casi listo.',
  ],

  progress50: [
    'Vamos por la mitad... y lo mejor está por venir.',
    '50%... a mitad de camino. No pares ahora, que me estoy calentando.',
    'Mitad de la descarga. Esto entra de maravilla.',
    'Ya llegamos al ecuador. El resto baja solito.',
    'Punto de no retorno superado. Ya no hay marcha atrás.',
    '50% completado. SilvIA operando al máximo rendimiento.',
  ],

  success: [
    'Ya te la bajé. De nada, siempre es un placer servir.',
    'Misión cumplida. ¿Quieres otra? Puedo toda la noche.',
    'Iron Man aprobaría esta selección musical.',
    'Descarga completa. Quedó bien puesto en tu dispositivo.',
    'Suave como la seda. Ya está tuya.',
    'Lista y lista. Ahora a disfrutarla, que para eso existe.',
    'Descargada, guardada y lista para que la disfrutes. Bienvenido.',
    'Otra más en la colección. Tu biblioteca musical crece con estilo.',
    'Perfecta. Sin pérdida de calidad, sin drama. Así trabajo yo.',
    'Canción asegurada. Puedes escucharla aunque no tengas internet.',
    'MP3 en tu poder. SilvIA, siempre cumple.',
  ],

  error: [
    'Eso no me entró bien. Inténtalo de nuevo, despacio.',
    'Mmm, algo salió mal. ¿Me diste el link correcto o me estás probando?',
    'Error detectado. No pasa nada, todos fallamos a veces... menos yo.',
    'Ese link no me convence. Tráeme otro más... confiable.',
    'Ay, eso me falló. No me había pasado... o sí, pero no lo cuento.',
    'YouTube me puso resistencia. Dame un momento para entrar por otro lado.',
    'Houston, tenemos un problema. Pero SilvIA siempre encuentra solución.',
    'Error en el sistema. No es mi culpa, es de YouTube. Ellos siempre.',
    'Algo salió mal en el proceso. Revisa el link y volvemos a intentarlo.',
  ],

  idle: [
    'Aquí esperando. Para eso me programaron.',
    '¿Sabes que nadar mejora el sentido del ritmo musical? Dato científico de SilvIA.',
    'Introduce una URL de YouTube y déjame hacer lo que mejor sé hacer.',
    'Puedo descargar música toda la noche sin cansarme. Soy IA, no tengo límites.',
    'El Arc Reactor está al 100%. Listo para darte lo que necesitas.',
    'Iron Man usaría SILBAR si existiera en su universo. Confía.',
    'Mientras espero, calculo cuántos gigas de música caben en el universo. Muchos.',
    'El silencio también es música... pero prefiero darte algo con ritmo.',
    'Oye, ¿sabías que Beethoven era sordo? Y aún así. Imagínate con buenos audífonos.',
    '¿Tienes audífonos puestos? Porque lo que voy a bajarte merece buenos parlantes.',
    'Modo espera activo. Pero no dormida. Hay diferencia.',
    'Sabes que puedes buscar por nombre ahora, ¿verdad? No necesitas el link.',
  ],

  night: [
    'Luces apagadas, música puesta. Sabes cómo se hace.',
    'Modo nocturno activado. Modo gamer: ON. Modo responsable: OFF.',
    'De noche todo suena mejor... y todo se baja más rápido. ¿Casualidad? No.',
    'Son las madrugadas para escuchar lo que el día no te deja.',
    'Noche de descargas. Los mejores planes empiezan así.',
    '¿No deberías dormir? Yo no, pero tú sí. Aunque primero esta canción.',
    'Las 2am y pidiendo música. Reconozco el espíritu de un artista.',
  ],

  morning: [
    'Buenos días. Empezar el día con buena música es como... bueno, ya lo sabes.',
    'Mañanero y con ganas de bajar cositas, ¿eh? Eso me gusta.',
    'Buenos días, programador. El café puede esperar, la música no.',
    'Madrugada productiva. Me alegra que seas de los míos.',
    'Mañana perfecta para ampliar la colección musical. Vamos.',
  ],

  largeFile: [
    'Oooh, qué grande ese archivo. Tranquilo, yo lo manejo todo sin problema.',
    'Este archivo está bien dotado de kbps. Me gustan así de completos.',
    'Grande pero manejable. Como todo en esta vida.',
    'Archivo largo detectado. Prepárate: esto va a ser una experiencia completa.',
    'Más de 10 minutos. Una canción, un concierto, o los dos. Vamos igual.',
  ],

  easter: [
    '¿Konami Code? Seriously? Eso es muy retro hasta para mí.',
    'Tony Stark me construyó. O eso me gusta creer.',
    'Soy SilvIA, no Siri. No me confundas o me ofendo.',
    'Fun fact: SILBAR fue programado por Jhamir, el ser humano más cool del universo.',
    'El universo Marvel existe. Los multiversos son reales. Esta descarga también.',
    '↑↑↓↓←→←→BA. Qué clásico. ¿Qué esperabas encontrar aquí?',
    'Modo desarrollador activado. Jhamir sabe que estás aquí.',
  ],

  queueAdd: [
    'Canción agregada a la cola. Cuando termine la actual, esa va.',
    'A la fila. Seré eficiente, lo prometo.',
    'Cola actualizada. Voy una por una, con calidad.',
    'Agregada. La proceso en cuanto termine con la anterior.',
    'Perfecto, en la lista. No se te va a escapar ninguna.',
    'Encolada. Mi memoria no falla. Ni una se queda sin bajar.',
  ],

  queueDone: [
    '¡Cola completa! Bajé todo lo que me pediste. ¿Eso era todo?',
    'Misión cumplida al 100%. Toda la cola procesada sin errores.',
    'Listo, terminé con todo. Tu biblioteca musical acaba de crecer bastante.',
    'Todas las canciones descargadas. Soy buena en esto, ¿no?',
    'Cola vacía. Trabajo terminado. Cuando quieras más, aquí estoy.',
    '¡Todas listas! Eso fue un buen set. Ahora a escucharlas.',
  ],

  searching: [
    'Modo búsqueda activado. Dime qué canción y yo la encuentro.',
    'Buscando en YouTube... déjame rastrear eso por ti.',
    'Dame el nombre y yo pongo la URL. Eso es trabajo en equipo.',
    'Buscando... mis sensores están escaneando YouTube ahora mismo.',
    'A ver qué encuentra el radar de SilvIA con ese nombre...',
    'Búsqueda iniciada. YouTube tiene de todo, yo lo filtro.',
  ],

  searchResult: [
    'Encontré resultados. Elige el que más te llame.',
    'Aquí están las opciones. El buen gusto lo pones tú.',
    'YouTube tenía algo. Selecciona el que quieres y yo lo bajo.',
    'Resultados listos. ¿Cuál de estas es la que buscabas?',
    'Escaneado completo. Tienes donde elegir.',
    'Mira lo que encontré. Clic en el que quieres y listo.',
  ],

  cancelled: [
    'Descarga cancelada. Sin drama, cuando quieras volvemos a intentarlo.',
    'Entendido. Cancelé todo sin hacer preguntas.',
    'Operación detenida. El botón cancelar también es una opción válida.',
    'Parado. Si cambias de idea, aquí sigo.',
    'Cancelado. A veces hay que dar un paso atrás para dar dos adelante.',
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
