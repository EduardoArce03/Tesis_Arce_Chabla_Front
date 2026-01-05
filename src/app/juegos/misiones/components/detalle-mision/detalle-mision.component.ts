import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { MisionService } from '../../services/mision.service';
import {
    DetalleMisionResponse,
    DificultadMision,
    TipoFase
} from '../../models/mision.model';
import { SesionService } from '@/services/sesion.service';

@Component({
    selector: 'app-detalle-mision',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        TagModule,
        DividerModule,
        ProgressBarModule,
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './detalle-mision.component.html',
    styleUrls: ['./detalle-mision.component.scss']
})
export class DetalleMisionComponent implements OnInit, OnDestroy {
    detalle: DetalleMisionResponse | null = null;
    misionId: number = 0;
    cargando = true;

    private destroy$ = new Subject<void>();

    // Enums para template
    DificultadMision = DificultadMision;
    TipoFase = TipoFase;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private misionService: MisionService,
        private sesionService: SesionService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        const usuario = this.sesionService.getUsuario();
        if (!usuario) {
            this.router.navigate(['/bienvenida']);
            return;
        }

        const id = this.route.snapshot.paramMap.get('id');
        this.misionId = id ? parseInt(id) : 0;

        if (this.misionId) {
            this.cargarDetalle(this.misionId, usuario.id);
        }
    }

    cargarDetalle(misionId: number, usuarioId: number): void {
        this.cargando = true;

        this.misionService.obtenerDetalleMision(misionId, usuarioId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (detalle) => {
                    this.detalle = detalle;
                    this.cargando = false;
                },
                error: (error) => {
                    console.error('Error cargando detalle:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo cargar la misión'
                    });
                    this.cargando = false;

                    // Redirigir después de 2 segundos
                    setTimeout(() => {
                        this.router.navigate(['/juegos/misiones']);
                    }, 2000);
                }
            });
    }

    iniciarMision(): void {
        const usuario = this.sesionService.getUsuario();
        if (!usuario) return;

        this.misionService.iniciarMision(this.misionId, usuario.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: '¡Misión Iniciada!',
                        detail: 'Buena suerte en tu aventura'
                    });

                    setTimeout(() => {
                        this.router.navigate(['/juegos/misiones', this.misionId, 'ejecutar']);
                    }, 1500);
                },
                error: (error) => {
                    console.error('Error iniciando misión:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.error?.message || 'No se pudo iniciar la misión'
                    });
                }
            });
    }

    continuarMision(): void {
        this.router.navigate(['/juegos/misiones', this.misionId, 'ejecutar']);
    }

    obtenerIconoDificultad(dificultad: DificultadMision): string {
        const iconos: Record<DificultadMision, string> = {
            [DificultadMision.FACIL]: '⭐',
            [DificultadMision.MEDIO]: '⭐⭐',
            [DificultadMision.DIFICIL]: '⭐⭐⭐',
            [DificultadMision.EXPERTO]: '⭐⭐⭐⭐'
        };
        return iconos[dificultad];
    }

    obtenerColorDificultad(dificultad: DificultadMision): 'success' | 'info' | 'warn' | 'danger' {
        const colores: Record<DificultadMision, 'success' | 'info' | 'warn' | 'danger'> = {
            [DificultadMision.FACIL]: 'success',
            [DificultadMision.MEDIO]: 'info',
            [DificultadMision.DIFICIL]: 'warn',
            [DificultadMision.EXPERTO]: 'danger'
        };
        return colores[dificultad];
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
