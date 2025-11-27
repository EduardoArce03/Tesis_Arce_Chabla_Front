// services/blip2-mock.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Blip2MockService {

    /**
     * Simula el análisis de una imagen por BLIP-2
     * En producción, esto llamaría a tu backend Flask
     */
    analizarImagen(imagenUrl: string, contexto?: any): Observable<string> {
        // Simulamos latencia de red + procesamiento IA
        const tiempoSimulado = 2000 + Math.random() * 1000;

        // Análisis mock basado en contexto
        const analisis = this.generarAnalisisMock(imagenUrl, contexto);

        return of(analisis).pipe(delay(tiempoSimulado));
    }

    /**
     * Simula generación de pregunta dinámica
     */
    generarPregunta(imagenUrl: string, contexto: any): Observable<any> {
        const tiempoSimulado = 2500 + Math.random() * 1000;

        const pregunta = this.generarPreguntaMock(contexto);

        return of(pregunta).pipe(delay(tiempoSimulado));
    }

    /**
     * Simula generación de narrativa
     */
    generarNarrativa(contexto: any): Observable<string> {
        const tiempoSimulado = 3000 + Math.random() * 1500;

        const narrativa = this.generarNarrativaMock(contexto);

        return of(narrativa).pipe(delay(tiempoSimulado));
    }

    private generarAnalisisMock(imagenUrl: string, contexto?: any): string {
        // En producción real, BLIP-2 analizaría la imagen
        // Por ahora devolvemos análisis pre-escritos contextuales

        const analisisPorTipo: Record<string, string> = {
            'templo': `Analizando la imagen con IA...

Observo una estructura elíptica con muros de piedra pulida y tallada. En la parte superior del muro oriental, detecto un patrón repetitivo de nichos escalonados, organizados en tres niveles distintos.

Las piedras muestran la característica técnica inca de ensamblaje perfecto sin mortero, pero la disposición escalonada de los nichos sugiere un significado ceremonial específico relacionado con la cosmovisión andina de los tres mundos.`,

            'agua': `Analizando la estructura hídrica...

Identifico un sistema de canales tallados en piedra que dirige el flujo del agua de manera intencional. Los canales presentan símbolos tallados en sus bordes, particularmente representaciones de serpientes.

La orientación del flujo sugiere un propósito ceremonial más allá de la función práctica, posiblemente relacionado con rituales de purificación o conexión entre los mundos andinos.`,

            'arquitectura': `Procesando detalles arquitectónicos...

Detecto dos técnicas de construcción distintas en la misma estructura: la base presenta piedras de forma irregular con uniones visibles (estilo cañari), mientras que la parte superior exhibe bloques perfectamente tallados con ensamblaje preciso (estilo inca).

Esta hibridación arquitectónica es inusual y sugiere una construcción en dos fases o la coexistencia intencional de ambos estilos culturales.`
        };

        // Determinar tipo basado en contexto
        const tipo = contexto?.tipo || 'templo';

        return analisisPorTipo[tipo] || analisisPorTipo['templo'];
    }

    private generarPreguntaMock(contexto: any): any {
        // Mock de preguntas según dificultad
        const preguntas = {
            facil: {
                pregunta: '¿Qué forma tiene la estructura principal del Templo del Sol?',
                opciones: [
                    { id: 'A', texto: 'Circular', correcta: false },
                    { id: 'B', texto: 'Elíptica', correcta: true },
                    { id: 'C', texto: 'Rectangular', correcta: false },
                    { id: 'D', texto: 'Cuadrada', correcta: false }
                ]
            },
            medio: {
                pregunta: '¿Qué representan los nichos escalonados en el muro del templo?',
                opciones: [
                    { id: 'A', texto: 'Decoración sin significado', correcta: false },
                    { id: 'B', texto: 'Los tres mundos andinos', correcta: true },
                    { id: 'C', texto: 'Almacenamiento de objetos', correcta: false },
                    { id: 'D', texto: 'Marcadores de tiempo', correcta: false }
                ]
            },
            dificil: {
                pregunta: '¿Por qué la arquitectura de Ingapirca combina técnicas cañari e inca?',
                opciones: [
                    { id: 'A', texto: 'Los Incas destruyeron todo lo cañari', correcta: false },
                    { id: 'B', texto: 'Representa sincretismo cultural intencional', correcta: true },
                    { id: 'C', texto: 'Fue un error de construcción', correcta: false },
                    { id: 'D', texto: 'Son dos estructuras separadas', correcta: false }
                ]
            }
        };

        const nivel = contexto?.dificultad || 'medio';
        return preguntas[nivel as keyof typeof preguntas] || preguntas.medio;
    }

    private generarNarrativaMock(contexto: any): string {
        return `Esta narrativa sería generada dinámicamente por BLIP-2 en producción,
    adaptada al contexto específico: ${JSON.stringify(contexto)}.

    La IA analizaría las respuestas del usuario y generaría una explicación
    personalizada que conecte con su nivel de comprensión demostrado.`;
    }
}
