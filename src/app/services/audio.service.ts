import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
    private audioContext: AudioContext;
    private currentAudio: HTMLAudioElement | null = null;

    constructor() {
        this.audioContext = new AudioContext();
    }

    reproducirMusicaTradicional(nombreArchivo: string): void {
        this.detener();
        this.currentAudio = new Audio(`assets/audio/musica-tradicional/${nombreArchivo}`);
        this.currentAudio.loop = true;
        this.currentAudio.volume = 0.5;
        this.currentAudio.play();
    }

    reproducirEfectoSonido(efecto: string): void {
        const audio = new Audio(`assets/audio/efectos-sonido/${efecto}`);
        audio.volume = 0.7;
        audio.play();
    }

    detener(): void {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
    }
}
