// data/misiones-mock.data.ts

import { Mision, TipoMision, DificultadMision, EstadoMision } from '../models/mision.model';
import { TipoFase } from '../models/fase-mision.model';
import { CategoriasCultural } from '@/models/juego.model';

export const MISIONES_MOCK: Mision[] = [
    {
        id: 'mision-001',
        titulo: 'Los Símbolos Perdidos',
        tituloKichwa: 'Chinkarishka Rikuykuna',
        descripcion: 'Descubre el significado oculto de los símbolos ceremoniales tallados en las piedras del Templo del Sol',
        descripcionCorta: 'Investiga símbolos ceremoniales en el Templo del Sol',

        tipo: TipoMision.INVESTIGACION,
        categoria: CategoriasCultural.LUGARES,
        dificultad: DificultadMision.MEDIO,

        npcGuia: {
            nombre: 'Mama Killa',
            nombreKichwa: 'Mama Killa',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mamakilla',
            descripcion: 'Sacerdotisa lunar, guardiana de los símbolos sagrados',
            personalidad: 'Sabia, paciente, misteriosa'
        },

        imagenPortada: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',

        requisitos: {
            nivelMinimo: 1,
            puntosVisitados: [],
            misionesPrevias: []
        },

        recompensas: {
            experiencia: 150,
            puntos: 100,
            insignias: [
                {
                    id: 'insignia-simbolos',
                    nombre: 'Intérprete de Símbolos',
                    nombreKichwa: 'Rikuy Yachak',
                    descripcion: 'Has descifrado los símbolos ceremoniales del Templo del Sol',
                    icono: '🔍',
                    rareza: 'raro'
                }
            ],
            desbloqueos: {
                misiones: ['mision-002'],
                puntosInteres: [3]
            },
            narrativaEspecial: true
        },

        tiempoEstimado: 15,
        estado: EstadoMision.DISPONIBLE,

        fases: [
            // FASE 1: INTRODUCCIÓN
            {
                id: 1,
                tipo: TipoFase.INTRODUCCION,
                titulo: 'El Llamado de Mama Killa',
                textoNarrativa: `Una suave brisa nocturna recorre Ingapirca mientras te acercas al Templo del Sol. Mama Killa, la sacerdotisa lunar, te espera con una expresión seria.

"Joven explorador, los antiguos sabios Cañari dejaron mensajes ocultos en las piedras de este templo sagrado. Mensajes que solo aquellos con ojos atentos pueden descifrar."

Ella señala hacia los muros del templo, donde las sombras de la luna revelan patrones tallados en la piedra.

"Necesito tu ayuda para descifrar uno de estos mensajes. Los símbolos que ves no son mera decoración - son las palabras de nuestros ancestros, esperando ser comprendidas..."`,
                imagenUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
                usaBlip2: false,
                obligatoria: true
            },

            // FASE 2: ANÁLISIS CON BLIP-2 (MOCK)
            {
                id: 2,
                tipo: TipoFase.ANALISIS_IMAGEN,
                titulo: 'Observando el Templo',
                textoNarrativa: 'Mama Killa te guía hacia el muro oriental del templo. "Observa con atención", susurra.',
                imagenUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
                usaBlip2: true,
                analisisBlip2: `Analizando la imagen con IA...

Observo una estructura elíptica con muros de piedra pulida y tallada. En la parte superior del muro oriental, detecto un patrón repetitivo de nichos escalonados, organizados en tres niveles distintos.

Las piedras muestran la característica técnica inca de ensamblaje perfecto sin mortero, pero la disposición escalonada de los nichos sugiere un significado ceremonial específico...`,
                obligatoria: true
            },

            // FASE 3: PREGUNTA DE INTERPRETACIÓN
            {
                id: 3,
                tipo: TipoFase.PREGUNTA_MULTIPLE,
                titulo: 'El Significado Oculto',
                textoNarrativa: 'Mama Killa observa tu análisis y pregunta:',
                imagenUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
                usaBlip2: false,
                pregunta: {
                    textoPregunta: '¿Qué representan los nichos escalonados dispuestos en tres niveles en el muro oriental del templo?',
                    tipo: 'multiple',
                    opciones: [
                        {
                            id: 'A',
                            texto: 'Son decoración arquitectónica sin significado específico',
                            correcta: false,
                            explicacion: 'En la arquitectura ceremonial andina, cada elemento tenía un propósito ritual y cosmogónico específico.'
                        },
                        {
                            id: 'B',
                            texto: 'Representan los tres niveles del mundo andino: Hanan Pacha, Kay Pacha y Uku Pacha',
                            correcta: true,
                            explicacion: '¡Correcto! Los tres niveles simbolizan la cosmovisión andina: el mundo superior (divino), el mundo presente (terrenal) y el mundo inferior (subterráneo).'
                        },
                        {
                            id: 'C',
                            texto: 'Servían únicamente para almacenar objetos ceremoniales',
                            correcta: false,
                            explicacion: 'Aunque podían contener ofrendas, su propósito principal era simbólico y representativo de la cosmogonía.'
                        },
                        {
                            id: 'D',
                            texto: 'Marcan las horas del día según la posición del sol',
                            correcta: false,
                            explicacion: 'Si bien los Cañari e Incas eran expertos en astronomía, estos nichos tenían un significado cosmogónico más profundo.'
                        }
                    ],
                    explicacion: 'Las hornacinas escalonadas representan la visión andina del cosmos dividido en tres mundos conectados.',
                    pista: 'Piensa en la cosmovisión andina y sus mundos conectados...',
                    elementosClave: ['Hanan Pacha', 'Kay Pacha', 'Uku Pacha', 'cosmovisión', 'tres mundos']
                },
                obligatoria: true
            },

            // FASE 4: REVELACIÓN NARRATIVA
            {
                id: 4,
                tipo: TipoFase.CONCLUSION,
                titulo: 'La Sabiduría Revelada',
                textoNarrativa: `Mama Killa sonríe con satisfacción al escuchar tu respuesta correcta.

"Excelente, joven yachak. Has demostrado visión más allá de lo evidente. Estos nichos no son simples huecos en la piedra - son portales simbólicos entre los mundos."

Ella se acerca al muro y toca suavemente cada nivel de nichos:

"Durante las ceremonias del Inti Raymi, los sacerdotes colocaban ofrendas en cada nivel:

- En el INFERIOR (Uku Pacha) - Chicha y objetos de arcilla, conectando con los ancestros bajo tierra
- En el MEDIO (Kay Pacha) - Maíz y textiles, representando la vida presente
- En el SUPERIOR (Hanan Pacha) - Oro y plumas, ofrendas para las divinidades celestes

Este conocimiento ha pasado de generación en generación desde tiempos de nuestros ancestros Cañari, antes incluso de que los Incas llegaran a estas tierras.

Los Incas respetaron esta disposición sagrada cuando construyeron sobre el sitio ceremonial cañari. Por eso ves la mezcla: la forma elíptica cañari dedicada a la serpiente sagrada Kan, con la mampostería pulida inca.

Cada piedra de este templo cuenta dos historias - la de los Cañari que veneraban a la luna, y la de los Incas que agregaron el culto al sol. Ambas culturas, dos visiones, un solo templo sagrado."

Mama Killa te entrega un pequeño objeto envuelto en tela.

"Toma esto como reconocimiento de tu comprensión. Eres digno del título de Rikuy Yachak - Intérprete de Símbolos."`,
                imagenUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600',
                usaBlip2: false,
                obligatoria: true
            }
        ]
    },

    // MISIÓN 2: BÚSQUEDA MULTI-PUNTO
    {
        id: 'mision-002',
        titulo: 'El Ciclo del Agua Sagrada',
        tituloKichwa: 'Yaku Muyuy',
        descripcion: 'Sigue el recorrido ceremonial del agua a través de Ingapirca y descubre cómo los Cañari conectaban los tres mundos mediante este elemento sagrado',
        descripcionCorta: 'Descubre el sistema ceremonial del agua en 4 puntos',

        tipo: TipoMision.BUSQUEDA_MULTI_PUNTO,
        categoria: CategoriasCultural.LUGARES,
        dificultad: DificultadMision.DIFICIL,

        npcGuia: {
            nombre: 'Yaku Yachak',
            nombreKichwa: 'Yaku Yachak',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yakuyachak',
            descripcion: 'Guardián ancestral del agua sagrada',
            personalidad: 'Sabio, reflexivo, conectado con la naturaleza'
        },

        imagenPortada: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',

        requisitos: {
            nivelMinimo: 3,
            misionesPrevias: ['mision-001']
        },

        recompensas: {
            experiencia: 500,
            puntos: 300,
            insignias: [
                {
                    id: 'insignia-agua',
                    nombre: 'Guardián de Yaku',
                    nombreKichwa: 'Yaku Rikuchik',
                    descripcion: 'Has comprendido el ciclo sagrado del agua en Ingapirca',
                    icono: '💧',
                    rareza: 'epico'
                }
            ],
            desbloqueos: {
                misiones: ['mision-003'],
                contenidoEspecial: ['documento-rituales-agua']
            },
            narrativaEspecial: true
        },

        tiempoEstimado: 30,
        estado: EstadoMision.BLOQUEADA,

        fases: [
            // FASE 1: INTRODUCCIÓN
            {
                id: 1,
                tipo: TipoFase.INTRODUCCION,
                titulo: 'El Llamado del Guardián',
                textoNarrativa: `El sonido del agua fluyendo te lleva hacia un anciano sentado junto a la pileta ceremonial. Sus ojos reflejan la sabiduría de siglos.

"Joven explorador, me han dicho que tienes ojos que ven más allá de las piedras. Bien. Necesito que me ayudes a recordar algo que mi abuelo me enseñó cuando era niño."

El anciano Yaku Yachak señala el agua fluyendo.

"El agua era sagrada para los Cañari. No solo la bebíamos - la venerábamos. Fluía a través del complejo siguiendo un camino ceremonial, conectando los tres mundos: Hanan, Kay y Uku Pacha.

Pero el tiempo ha borrado parte de mi memoria... Ya no recuerdo el orden exacto del ciclo sagrado."

Te mira fijamente:

"Visita los 4 puntos donde el agua cumplía su función ceremonial. En cada uno, encontrarás una pista. Cuando las tengas todas, podrás ayudarme a reconstruir el ciclo completo."`,
                imagenUrl: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
                usaBlip2: false,
                obligatoria: true
            },

            // FASE 2: BÚSQUEDA DE 4 PUNTOS
            {
                id: 2,
                tipo: TipoFase.BUSQUEDA_PUNTO,
                titulo: 'En Busca del Ciclo Sagrado',
                textoNarrativa: 'Debes visitar los 4 puntos ceremoniales del agua. El mapa se ha actualizado con su ubicación.',
                usaBlip2: false,
                puntosObjetivo: [6, 7, 2, 4], // IDs de puntos de interés
                pistasProgreso: [
                    'Has encontrado la Pileta Ceremonial. El agua comienza su viaje aquí...',
                    'Has descubierto el Canal Subterráneo. El agua desciende a Uku Pacha...',
                    'Has llegado a la Fuente Central. El agua renace en Kay Pacha...',
                    'Has encontrado los Qolqa. El agua completa su ciclo hacia Hanan Pacha...'
                ],
                obligatoria: true
            },

            // FASE 3: PUZZLE DE ORDENAMIENTO
            {
                id: 3,
                tipo: TipoFase.ORDENAMIENTO,
                titulo: 'Reconstruye el Ciclo',
                textoNarrativa: 'Has recolectado las 4 pistas. Ahora ordena cronológicamente el ciclo ceremonial del agua.',
                usaBlip2: false,
                puzzle: {
                    tipo: 'ordenar',
                    elementos: [
                        {
                            id: 'punto-pileta',
                            contenido: 'Pileta Ceremonial - El agua nace pura, representa el amanecer',
                            imagen: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400'
                        },
                        {
                            id: 'punto-canal',
                            contenido: 'Canal Subterráneo - El agua desciende a Uku Pacha (inframundo)',
                            imagen: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400'
                        },
                        {
                            id: 'punto-fuente',
                            contenido: 'Fuente Central - El agua renace purificada en Kay Pacha (mundo presente)',
                            imagen: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
                        },
                        {
                            id: 'punto-qolqa',
                            contenido: 'Qolqa (Depósitos) - El agua almacenada asciende como ofrenda a Hanan Pacha',
                            imagen: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400'
                        }
                    ],
                    solucion: ['punto-pileta', 'punto-canal', 'punto-fuente', 'punto-qolqa'],
                    ayudaVisual: 'Piensa en el ciclo de la vida: nacimiento → muerte → renacimiento → trascendencia'
                },
                obligatoria: true
            },

            // FASE 4: REVELACIÓN FINAL
            {
                id: 4,
                tipo: TipoFase.CONCLUSION,
                titulo: 'La Sabiduría del Agua',
                textoNarrativa: `Yaku Yachak cierra los ojos y sonríe cuando le muestras el orden correcto.

"¡Sí! ¡Así era! Has reconstruido el Yaku Muyuy - el Ciclo Sagrado del Agua."

El anciano se pone de pie con renovada energía:

"Déjame explicarte lo que has descubierto, joven guardián:

**1. PILETA CEREMONIAL (Nacimiento)**
El agua brotaba pura de la tierra, como el sol al amanecer. Los sacerdotes la recogían en vasijas de arcilla especial antes de que tocara el suelo, manteniéndola en su estado más sagrado.

**2. CANAL SUBTERRÁNEO (Muerte/Descenso)**
El agua descendía deliberadamente a Uku Pacha, el mundo de abajo. No era desperdicio - era un viaje necesario. Atravesaba cavernas donde los ancestros 'bebían' simbólicamente, conectándose con los vivos.

**3. FUENTE CENTRAL (Renacimiento)**
Tras purificarse en el inframundo, el agua emergía en la plaza ceremonial. Este era el momento de máxima potencia ritual - había 'muerto' y 'renacido', conteniendo ahora el poder de ambos mundos.

**4. QOLQA (Trascendencia)**
Finalmente, el agua era almacenada en vasijas ceremoniales en lo alto de los depósitos. Desde ahí, durante los rituales, se vertía como ofrenda, ascendiendo como vapor hacia Hanan Pacha, completando su viaje a los tres mundos.

Este ciclo se repetía durante cada ceremonia importante: Inti Raymi, Pawkar Raymi, Killa Raymi. El agua conectaba TODO - tierra, inframundo y cielo. Vida, muerte y renacimiento.

Los Incas, cuando llegaron, quedaron tan impresionados con este sistema que lo preservaron casi intacto, solo añadiendo sus propios símbolos solares."

El anciano te toma del hombro:

"Ahora eres tú quien debe preservar este conocimiento. Eres Yaku Rikuchik - Guardián del Agua Sagrada."`,
                imagenUrl: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
                usaBlip2: false,
                obligatoria: true
            }
        ]
    },

    // MISIÓN 3: MISTERIO (Bloqueada - ejemplo de misión avanzada)
    {
        id: 'mision-003',
        titulo: 'El Enigma de la Doble Cultura',
        tituloKichwa: 'Ishkay Kawsay Pacha',
        descripcion: 'Investiga por qué Ingapirca muestra dos estilos arquitectónicos distintos y descubre la verdadera historia del encuentro entre Cañaris e Incas',
        descripcionCorta: 'Resuelve el misterio del sincretismo arquitectónico',

        tipo: TipoMision.MISTERIO,
        categoria: CategoriasCultural.LUGARES,
        dificultad: DificultadMision.EXPERTO,

        npcGuia: {
            nombre: 'Amawta',
            nombreKichwa: 'Amawta',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amawta',
            descripcion: 'Sabio ancestral, guardián de la historia',
            personalidad: 'Profundamente sabio, desafiante, busca la verdad'
        },

        imagenPortada: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',

        requisitos: {
            nivelMinimo: 5,
            misionesPrevias: ['mision-001', 'mision-002'],
            insignias: ['insignia-simbolos', 'insignia-agua']
        },

        recompensas: {
            experiencia: 800,
            puntos: 500,
            insignias: [
                {
                    id: 'insignia-amawta',
                    nombre: 'Amawta Junior',
                    nombreKichwa: 'Amawta Ñawi',
                    descripcion: 'Has demostrado capacidad de análisis histórico crítico',
                    icono: '🎓',
                    rareza: 'legendario'
                }
            ],
            desbloqueos: {
                contenidoEspecial: ['biblioteca-academica', 'documentos-sincretismo']
            },
            narrativaEspecial: true
        },

        tiempoEstimado: 45,
        estado: EstadoMision.BLOQUEADA,

        fases: [
            {
                id: 1,
                tipo: TipoFase.INTRODUCCION,
                titulo: 'El Desafío del Amawta',
                textoNarrativa: `Un anciano de mirada penetrante te intercepta al entrar al Templo del Sol.

"Así que tú eres quien ha estado descifrando nuestros secretos..."

Su tono no es hostil, pero sí desafiante.

"Déjame ponerte a prueba, joven. Has aprendido sobre símbolos y agua, pero ¿entiendes realmente lo que ves?"

El Amawta señala dos secciones del mismo muro:

"Mira esto: piedra irregular, cañari. Y esto: piedra pulida perfecta, inca. Mismo edificio, dos técnicas. ¿Por qué?"

Te entrega dos imágenes antiguas:

"Algunos historiadores dicen que los Incas destruyeron todo lo cañari. Otros dicen que convivieron pacíficamente. ¿Qué dice la evidencia que tienes frente a ti?"

Sus ojos brillan con curiosidad:

"Investiga. Busca evidencia. Y tráeme tu conclusión - pero que sea TU conclusión, basada en lo que observes, no en lo que otros te digan."`,
                imagenUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
                usaBlip2: false,
                obligatoria: true
            }
            // ... Más fases (análisis, evidencias, conclusión)
        ]
    }
];

// NPCs disponibles
export const NPCS_DISPONIBLES = [
    {
        nombre: 'Mama Killa',
        nombreKichwa: 'Mama Killa',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mamakilla',
        descripcion: 'Sacerdotisa lunar, guardiana de los símbolos sagrados',
        especialidad: 'Símbolos y cosmogonía'
    },
    {
        nombre: 'Yaku Yachak',
        nombreKichwa: 'Yaku Yachak',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yakuyachak',
        descripcion: 'Guardián ancestral del agua sagrada',
        especialidad: 'Rituales del agua'
    },
    {
        nombre: 'Amawta',
        nombreKichwa: 'Amawta',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amawta',
        descripcion: 'Sabio ancestral, guardián de la historia',
        especialidad: 'Historia y sincretismo cultural'
    }
];
