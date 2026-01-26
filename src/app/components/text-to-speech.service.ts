import { Injectable } from '@angular/core';

// Declaración global para TypeScript
declare global {
    interface Window {
        responsiveVoice: any;
    }
}

@Injectable({
    providedIn: 'root'
})
export class TextToSpeechService {

    narrar(texto: string): void {
        console.log('🔊 Narrando con ResponsiveVoice:', texto);

        // Verificar que ResponsiveVoice existe
        if (typeof window.responsiveVoice === 'undefined') {
            console.error('❌ ResponsiveVoice NO está cargado');
            console.error('👉 Verifica que el script esté en index.html');
            return;
        }

        // Cancelar narración anterior si existe
        if (window.responsiveVoice.isPlaying()) {
            window.responsiveVoice.cancel();
        }

        // Narrar
        window.responsiveVoice.speak(texto, 'Spanish Latin American Female', {
            pitch: 1,
            rate: 0.9,
            volume: 1,
            onstart: () => console.log('▶️ Iniciado'),
            onend: () => console.log('✅ Finalizado'),
            onerror: (e: any) => console.error('❌ Error:', e)
        });
    }

    detener(): void {
        if (window.responsiveVoice) {
            window.responsiveVoice.cancel();
        }
    }

    pausar(): void {
        if (window.responsiveVoice && window.responsiveVoice.isPlaying()) {
            window.responsiveVoice.pause();
        }
    }

    reanudar(): void {
        if (window.responsiveVoice) {
            window.responsiveVoice.resume();
        }
    }

    estaHablando(): boolean {
        return window.responsiveVoice ? window.responsiveVoice.isPlaying() : false;
    }
}
