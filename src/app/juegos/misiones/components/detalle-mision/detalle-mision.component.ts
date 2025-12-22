// components/detalle-mision/detalle-mision.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { Mision, EstadoMision, DificultadMision } from '../../models/mision.model';
import { MisionService } from '@/juegos/misiones/services/mision..service';

@Component({
    selector: 'app-detalle-mision',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        TagModule,
        DividerModule,
        AvatarModule,
        DialogModule,
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './detalle-mision.component.html',
    styleUrls: ['./detalle-mision.component.scss']
})
export class DetalleMisionComponent implements OnInit, OnDestroy {
    mision: Mision | null = null;
    misionId: string = '';
    mostrarDialogIniciar = false;

    private destroy$ = new Subject<void>();

    // Enums para template
    EstadoMision = EstadoMision;
    DificultadMision = DificultadMision;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private misionService: MisionService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.misionId = this.route.snapshot.paramMap.get('id') || '';
        this.cargarMision();
    }

    cargarMision(): void {
        this.misionService.obtenerMisionPorId(this.misionId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(mision => {
                if (mision) {
                    this.mision = mision;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Misión no encontrada'
                    });
                    this.volverALista();
                }
            });
    }

    abrirDialogIniciar(): void {
        if (this.mision?.estado === EstadoMision.BLOQUEADA) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Misión Bloqueada',
                detail: 'Debes completar los requisitos primero'
            });
            return;
        }

        this.mostrarDialogIniciar = true;
    }

    iniciarMision(): void {
        if (!this.mision) return;

        this.misionService
            .iniciarMision(this.mision.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (progreso) => {
                    this.mostrarDialogIniciar = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: '¡Misión Iniciada!',
                        detail: `Comenzando: ${this.mision?.titulo}`
                    });

                    setTimeout(() => {
                        this.router.navigate(['/juegos/misiones', this.mision?.id, 'ejecutar']); // ✅ Corregido
                    }, 1000);
                },
                error: (error: { message: any }) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message
                    });
                }
            });
    }

    continuarMision(): void {
        this.router.navigate(['/juegos/misiones', this.mision?.id, 'ejecutar']); // ✅ Corregido
    }

    volverALista(): void {
        this.router.navigate(['/juegos/misiones']); // ✅ Corregido
    }

    obtenerIconoDificultad(dificultad: DificultadMision): string {
        const iconos = {
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
            [DificultadMision.DIFICIL]: 'warn',      // ← CAMBIO: 'warning' → 'warn'
            [DificultadMision.EXPERTO]: 'danger'
        };
        return colores[dificultad];
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Agregar estos métodos al DetalleMisionComponent

    obtenerIconoFase(tipoFase: string): string {
        const iconos: Record<string, string> = {
            'INTRODUCCION': 'pi-book',
            'ANALISIS_IMAGEN': 'pi-image',
            'PREGUNTA_MULTIPLE': 'pi-question-circle',
            'PREGUNTA_ABIERTA': 'pi-pencil',
            'BUSQUEDA_PUNTO': 'pi-map-marker',
            'PUZZLE': 'pi-th-large',
            'ORDENAMIENTO': 'pi-sort-alt',
            'SELECCION_MULTIPLE': 'pi-list',
            'CONCLUSION': 'pi-check-circle'
        };
        return iconos[tipoFase] || 'pi-circle';
    }

    obtenerNombreFase(tipoFase: string): string {
        const nombres: Record<string, string> = {
            'INTRODUCCION': 'Introducción',
            'ANALISIS_IMAGEN': 'Análisis con IA',
            'PREGUNTA_MULTIPLE': 'Pregunta de Opción Múltiple',
            'PREGUNTA_ABIERTA': 'Pregunta Abierta',
            'BUSQUEDA_PUNTO': 'Búsqueda de Puntos',
            'PUZZLE': 'Puzzle Interactivo',
            'ORDENAMIENTO': 'Ordenar Elementos',
            'SELECCION_MULTIPLE': 'Selección Múltiple',
            'CONCLUSION': 'Conclusión'
        };
        return nombres[tipoFase] || tipoFase;
    }

    obtenerColorRareza(rareza: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const colores: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            'comun': 'secondary',
            'raro': 'info',
            'epico': 'warn',        // ← Cambié 'warning' a 'warn'
            'legendario': 'danger'
        };
        return colores[rareza] || 'secondary';
    }
}
