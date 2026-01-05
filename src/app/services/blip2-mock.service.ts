import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class Blip2MockService {

    constructor() {}

    analizarImagen(imageUrl: string, contexto?: any): Observable<string> {
        // Simulación de análisis con IA
        const analisisMock = this.generarAnalisisMock(contexto);

        // Simular delay de procesamiento (2-3 segundos)
        return of(analisisMock).pipe(
            delay(2500)
        );
    }

    private generarAnalisisMock(contexto?: any): string {
        if (contexto?.tipo === 'templo') {
            return `Este es el majestuoso Templo del Sol de Ingapirca, la estructura más icónica del complejo arqueológico.
      Su característica forma elíptica representa la armonía entre las culturas Cañari e Inca. Las piedras están
      perfectamente talladas y ensambladas sin argamasa, demostrando la maestría de la ingeniería inca. El edificio
      está orientado estratégicamente para observar los solsticios, funcionando como un calendario astronómico viviente.`;
        }

        return `Imagen analizada correctamente. Esta estructura muestra elementos arquitectónicos característicos de la
    cultura andina, con técnicas de construcción avanzadas para su época.`;
    }
}
