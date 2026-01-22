// exploracion-capa.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';

// ✅ IMPORTAR desde models
import { ObjetivoFotograficoDTO } from '@/models/exploracion_final.model';

@Component({
    selector: 'app-exploracion-capa',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        ProgressBarModule,
        DialogModule,
        FileUploadModule,
        TagModule,
        DividerModule
    ],
    template: `
        <div class="exploracion-capa-container">
            <!-- Header -->
            <div class="header">
                <p-button
                    icon="pi pi-arrow-left"
                    [text]="true"
                    (onClick)="volver.emit()">
                </p-button>
                <div class="header-info">
                    <h2>Capa {{ numeroCapa }}: {{ nombreCapa }}</h2>
                    <span class="epoca">{{ epoca }}</span>
                </div>
                <div class="medalla">{{ medallaActual }}</div>
            </div>

            <!-- Progreso -->
            <div class="progreso-capa">
                <div class="flex justify-content-between mb-2">
                    <span>Progreso General</span>
                    <span class="font-bold">{{ porcentajeCompletado }}%</span>
                </div>
                <p-progressBar
                    [value]="porcentajeCompletado"
                    [showValue]="false">
                </p-progressBar>
                <small class="hint">
                    Completa todo para obtener la medalla 🥇 ORO
                </small>
            </div>

            <!-- 1. NARRATIVA HISTÓRICA -->
            <p-card class="section-card">
                <ng-template pTemplate="header">
                    <div class="section-header">
                        <h3>📖 Narrativa Histórica</h3>
                        <i *ngIf="narrativaLeida" class="pi pi-check-circle text-green-500"></i>
                    </div>
                </ng-template>

                <div *ngIf="!narrativaLeida" class="narrativa-container">
                    <div *ngIf="cargandoNarrativa" class="loading">
                        <i class="pi pi-spin pi-spinner"></i>
                        <p>Generando narrativa con IA...</p>
                    </div>

                    <div *ngIf="!cargandoNarrativa && !narrativaLeida" class="narrativa-nueva">
                        <p class="typing-text">{{ narrativaVisible }}</p>
                        <div class="narrativa-actions" *ngIf="narrativaCompleta">
                            <p-button
                                label="Marcar como leída"
                                icon="pi pi-check"
                                (onClick)="marcarNarrativaLeida()">
                            </p-button>
                        </div>
                    </div>
                </div>

                <div *ngIf="narrativaLeida" class="narrativa-leida">
                    <i class="pi pi-check-circle"></i>
                    <p>Ya leíste esta narrativa</p>
                    <p-button
                        label="Ver completa"
                        [text]="true"
                        size="small"
                        (onClick)="mostrarNarrativaCompleta = true">
                    </p-button>
                </div>
            </p-card>

            <!-- 2. OBJETIVOS FOTOGRÁFICOS -->
            <p-card class="section-card">
                <ng-template pTemplate="header">
                    <div class="section-header">
                        <h3>📸 Objetivos Fotográficos ({{ fotosCompletadas }}/{{ fotosTotales }})</h3>
                    </div>
                </ng-template>

                <div class="objetivos-lista">
                    <div *ngFor="let objetivo of objetivosFotograficos"
                         class="objetivo-item"
                         [class.completado]="objetivo.completado">

                        <div class="objetivo-header">
                            <div class="objetivo-info">
                                <i class="pi"
                                   [class.pi-check-circle]="objetivo.completado"
                                   [class.pi-camera]="!objetivo.completado"></i>
                                <span>{{ objetivo.descripcion }}</span>
                            </div>
                            <p-tag
                                [value]="objetivo.rareza"
                                [severity]="obtenerSeveridadRareza(objetivo.rareza)">
                            </p-tag>
                        </div>

                        <div class="objetivo-detalles">
                            <span class="puntos">+{{ objetivo.puntosRecompensa }} puntos</span>

                            <div *ngIf="objetivo.completado" class="foto-completada">
                                <img [src]="objetivo.imagenUrl" alt="Foto capturada" class="thumbnail">
                                <small>Capturado el {{ objetivo.fechaCaptura }}</small>
                            </div>

                            <p-button
                                *ngIf="!objetivo.completado"
                                label="📷 Tomar Foto"
                                size="small"
                                (onClick)="abrirCaptura(objetivo)">
                            </p-button>
                        </div>
                    </div>
                </div>
            </p-card>

            <!-- 3. DIÁLOGO CON ESPÍRITU -->
            <p-card class="section-card">
                <ng-template pTemplate="header">
                    <div class="section-header">
                        <h3>💬 Dialogar con {{ nombreEspiritu }}</h3>
                        <span class="dialogos-count">{{ dialogosRealizados }}/{{ dialogosRequeridos }}</span>
                    </div>
                </ng-template>

                <div class="espiritu-container">
                    <div class="espiritu-avatar">
                        <div class="avatar-circle">👻</div>
                        <p class="espiritu-nombre">{{ nombreEspiritu }}</p>
                        <p class="espiritu-desc">{{ descripcionEspiritu }}</p>
                    </div>

                    <div class="nivel-confianza">
                        <span>Nivel de confianza:</span>
                        <div class="estrellas">
                            <i *ngFor="let i of [1,2,3,4,5]"
                               class="pi"
                               [class.pi-star-fill]="i <= nivelConfianza"
                               [class.pi-star]="i > nivelConfianza"></i>
                        </div>
                    </div>

                    <p-button
                        label="💬 Iniciar Diálogo"
                        styleClass="w-full"
                        (onClick)="abrirDialogo()">
                    </p-button>

                    <!-- Historial de diálogos -->
                    <div *ngIf="historialDialogos.length > 0" class="historial">
                        <p-divider></p-divider>
                        <h4>Conversaciones anteriores</h4>
                        <div *ngFor="let dialogo of historialDialogos" class="dialogo-anterior">
                            <p class="pregunta"><strong>Tú:</strong> {{ dialogo.pregunta }}</p>
                            <p class="respuesta"><strong>{{ nombreEspiritu }}:</strong> {{ dialogo.respuesta }}</p>
                        </div>
                    </div>
                </div>
            </p-card>

            <!-- 4. MISIÓN ACTIVA (si existe) -->
            <p-card *ngIf="misionActiva" class="section-card mision-card">
                <ng-template pTemplate="header">
                    <div class="section-header">
                        <h3>📋 Misión: {{ misionActiva.titulo }}</h3>
                        <p-tag value="En Progreso" severity="warn"></p-tag>
                    </div>
                </ng-template>

                <div class="mision-contenido">
                    <p>{{ misionActiva.descripcion }}</p>

                    <div class="progreso-mision">
                        <span>Progreso</span>
                        <p-progressBar
                            [value]="misionActiva.progreso"
                            [showValue]="true">
                        </p-progressBar>
                    </div>

                    <div class="mision-tareas">
                        <h4>Tareas:</h4>
                        <div *ngFor="let tarea of misionActiva.tareas" class="tarea-item">
                            <i class="pi"
                               [class.pi-check-circle]="tarea.completada"
                               [class.pi-circle]="!tarea.completada"></i>
                            <span>{{ tarea.descripcion }}</span>
                        </div>
                    </div>
                </div>
            </p-card>
        </div>

        <!-- MODAL: Captura de fotografía -->
        <p-dialog
            [(visible)]="mostrarModalCaptura"
            header="📷 Capturar Fotografía"
            [modal]="true"
            [style]="{width: '600px'}">

            <div *ngIf="objetivoSeleccionado" class="captura-container">
                <h4>{{ objetivoSeleccionado.descripcion }}</h4>
                <p-tag [value]="objetivoSeleccionado.rareza"
                       [severity]="obtenerSeveridadRareza(objetivoSeleccionado.rareza)">
                </p-tag>

                <div class="upload-area">
                    <p-fileUpload
                        mode="basic"
                        chooseLabel="Seleccionar Imagen"
                        accept="image/*"
                        [maxFileSize]="5000000"
                        (onSelect)="onFileSelect($event)">
                    </p-fileUpload>
                </div>

                <div *ngIf="imagenSeleccionada" class="imagen-preview">
                    <img [src]="imagenSeleccionada" alt="Preview">
                </div>

                <div *ngIf="analizandoFoto" class="loading">
                    <i class="pi pi-spin pi-spinner"></i>
                    <p>🤖 Analizando fotografía con IA...</p>
                </div>

                <div *ngIf="resultadoAnalisis" class="resultado-analisis">
                    <div [class.exito]="resultadoAnalisis.exito"
                         [class.error]="!resultadoAnalisis.exito">
                        <i class="pi"
                           [class.pi-check-circle]="resultadoAnalisis.exito"
                           [class.pi-times-circle]="!resultadoAnalisis.exito"></i>
                        <p>{{ resultadoAnalisis.mensaje }}</p>
                    </div>

                    <div *ngIf="resultadoAnalisis.exito" class="recompensas">
                        <h4>🎁 Recompensas:</h4>
                        <ul>
                            <li *ngFor="let recompensa of resultadoAnalisis.recompensas">
                                {{ recompensa }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <p-button
                    label="Cancelar"
                    severity="secondary"
                    (onClick)="cerrarCaptura()">
                </p-button>
                <p-button
                    *ngIf="imagenSeleccionada && !analizandoFoto"
                    label="Analizar"
                    (onClick)="analizarFoto()">
                </p-button>
            </ng-template>
        </p-dialog>

        <!-- MODAL: Diálogo con espíritu -->
        <p-dialog
            [(visible)]="mostrarModalDialogo"
            [header]="'👻 Diálogo con ' + nombreEspiritu"
            [modal]="true"
            [style]="{width: '700px', height: '600px'}">

            <div class="dialogo-container">
                <!-- Chat -->
                <div class="chat-area">
                    <div class="mensaje espiritu-msg">
                        <strong>{{ nombreEspiritu }}:</strong>
                        <p>{{ mensajeBienvenida }}</p>
                    </div>

                    <div *ngFor="let msg of conversacionActual"
                         class="mensaje"
                         [class.usuario-msg]="msg.esUsuario"
                         [class.espiritu-msg]="!msg.esUsuario">
                        <strong>{{ msg.esUsuario ? 'Tú' : nombreEspiritu }}:</strong>
                        <p>{{ msg.texto }}</p>
                    </div>

                    <div *ngIf="esperandoRespuesta" class="mensaje espiritu-msg typing">
                        <i class="pi pi-spin pi-spinner"></i>
                        <p>{{ nombreEspiritu }} está pensando...</p>
                    </div>
                </div>

                <!-- Input -->
                <div class="input-area">
                    <textarea
                        pInputTextarea
                        [(ngModel)]="preguntaUsuario"
                        placeholder="Escribe tu pregunta..."
                        [rows]="3"
                        [disabled]="esperandoRespuesta">
                    </textarea>
                    <p-button
                        label="Enviar"
                        icon="pi pi-send"
                        [disabled]="!preguntaUsuario || esperandoRespuesta"
                        (onClick)="enviarPregunta()">
                    </p-button>
                </div>

                <!-- Sugerencias -->
                <div class="sugerencias">
                    <small>💡 Sugerencias:</small>
                    <div class="sugerencias-lista">
                        <p-button
                            *ngFor="let sug of sugerencias"
                            [label]="sug"
                            size="small"
                            [text]="true"
                            (onClick)="preguntaUsuario = sug">
                        </p-button>
                    </div>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <p-button
                    label="Terminar Diálogo"
                    severity="secondary"
                    (onClick)="cerrarDialogo()">
                </p-button>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        .exploracion-capa-container {
            padding: 1rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .header-info h2 {
            margin: 0;
        }

        .epoca {
            color: #7f8c8d;
            font-size: 0.9rem;
        }

        .medalla {
            font-size: 3rem;
        }

        .progreso-capa {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }

        .section-card {
            margin-bottom: 1.5rem;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
        }

        .narrativa-container,
        .narrativa-nueva {
            min-height: 200px;
        }

        .typing-text {
            font-size: 1.1rem;
            line-height: 1.8;
        }

        .loading {
            text-align: center;
            padding: 2rem;
        }

        .objetivos-lista {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .objetivo-item {
            border: 2px solid #ecf0f1;
            padding: 1rem;
            border-radius: 8px;
        }

        .objetivo-item.completado {
            border-color: #27ae60;
            background: #eafaf1;
        }

        .objetivo-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }

        .objetivo-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .thumbnail {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 4px;
        }

        .espiritu-container {
            text-align: center;
        }

        .avatar-circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            margin: 0 auto 1rem;
        }

        .nivel-confianza {
            margin: 1rem 0;
        }

        .estrellas i {
            color: #f39c12;
            font-size: 1.5rem;
        }

        .dialogo-container {
            display: flex;
            flex-direction: column;
            height: 450px;
        }

        .chat-area {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
            background: #f8f9fa;
        }

        .mensaje {
            margin-bottom: 1rem;
            padding: 1rem;
            border-radius: 8px;
        }

        .usuario-msg {
            background: #e3f2fd;
            margin-left: 2rem;
        }

        .espiritu-msg {
            background: #f3e5f5;
            margin-right: 2rem;
        }

        .input-area {
            padding: 1rem;
            display: flex;
            gap: 0.5rem;
        }

        .input-area textarea {
            flex: 1;
        }
    `]
})
export class ExploracionCapaComponent implements OnInit {
    @Input() numeroCapa = 1;
    @Input() nombreCapa = '';
    @Input() epoca = '';
    @Input() medallaActual = '⭐';
    @Input() porcentajeCompletado = 0;

    // Narrativa
    @Input() narrativaLeida = false;
    narrativaVisible = '';
    narrativaCompleta = false;
    cargandoNarrativa = false;
    mostrarNarrativaCompleta = false;

    // Fotografías
    @Input() objetivosFotograficos: ObjetivoFotograficoDTO[] = [];
    mostrarModalCaptura = false;
    objetivoSeleccionado: ObjetivoFotograficoDTO | null = null;
    imagenSeleccionada: string | null = null;
    analizandoFoto = false;
    resultadoAnalisis: any = null;

    // Espíritu
    @Input() nombreEspiritu = '';
    @Input() descripcionEspiritu = '';
    @Input() dialogosRealizados = 0;
    @Input() dialogosRequeridos = 3;
    nivelConfianza = 0;
    mostrarModalDialogo = false;
    preguntaUsuario = '';
    esperandoRespuesta = false;
    mensajeBienvenida = '';
    conversacionActual: any[] = [];
    historialDialogos: any[] = [];
    sugerencias: string[] = [];

    // Misión
    @Input() misionActiva: any = null;

    @Output() volver = new EventEmitter<void>();
    @Output() capaCompletada = new EventEmitter<void>(); // 9️⃣ DESBLOQUEO AUTOMÁTICO


    get fotosCompletadas(): number {
        return this.objetivosFotograficos.filter(o => o.completado).length;
    }

    get fotosTotales(): number {
        return this.objetivosFotograficos.length;
    }

    ngOnInit(): void {
        if (!this.narrativaLeida) {
            this.cargarNarrativa();
        }
        this.calcularNivelConfianza();
    }

    cargarNarrativa(): void {
        this.cargandoNarrativa = true;
        // Simular llamada a IA
        setTimeout(() => {
            this.cargandoNarrativa = false;
            this.animarTexto("Esta es la narrativa generada por IA...");
        }, 2000);
    }

    animarTexto(texto: string): void {
        let i = 0;
        const interval = setInterval(() => {
            this.narrativaVisible = texto.substring(0, i);
            i++;
            if (i > texto.length) {
                clearInterval(interval);
                this.narrativaCompleta = true;
            }
        }, 30);
    }

    marcarNarrativaLeida(): void {
        this.narrativaLeida = true;
        // Aquí llamar al backend
    }

    // Fotografías
    abrirCaptura(objetivo: ObjetivoFotograficoDTO): void {
        this.objetivoSeleccionado = objetivo;
        this.mostrarModalCaptura = true;
        this.imagenSeleccionada = null;
        this.resultadoAnalisis = null;
    }

    onFileSelect(event: any): void {
        const file = event.files[0];
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.imagenSeleccionada = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    analizarFoto(): void {
        this.analizandoFoto = true;
        // Simular análisis IA
        setTimeout(() => {
            this.analizandoFoto = false;
            this.resultadoAnalisis = {
                exito: true,
                mensaje: "✅ ¡Fotografía validada!",
                recompensas: ["+300 puntos", "+50 XP", "Badge: Cazador de Símbolos"]
            };
        }, 3000);
    }

    cerrarCaptura(): void {
        this.mostrarModalCaptura = false;
    }

    // Diálogos
    abrirDialogo(): void {
        this.mostrarModalDialogo = true;
        this.mensajeBienvenida = `Saludos, viajero del tiempo. Soy ${this.nombreEspiritu}...`;
        this.sugerencias = [
            "¿Cómo era la vida en tu época?",
            "¿Qué rituales realizaban aquí?",
            "¿Por qué este lugar era sagrado?"
        ];
    }

    enviarPregunta(): void {
        if (!this.preguntaUsuario.trim()) return;

        this.conversacionActual.push({
            esUsuario: true,
            texto: this.preguntaUsuario
        });

        this.esperandoRespuesta = true;
        const pregunta = this.preguntaUsuario;
        this.preguntaUsuario = '';

        // Simular respuesta IA
        setTimeout(() => {
            this.conversacionActual.push({
                esUsuario: false,
                texto: "Esta es la respuesta generada por IA..."
            });
            this.esperandoRespuesta = false;
            this.dialogosRealizados++;
            this.calcularNivelConfianza();
        }, 2000);
    }

    cerrarDialogo(): void {
        this.mostrarModalDialogo = false;
        // Guardar en historial
    }

    calcularNivelConfianza(): void {
        this.nivelConfianza = Math.min(5, Math.floor(this.dialogosRealizados / 3) + 1);
    }

    obtenerSeveridadRareza(rareza: string): 'secondary' | 'info' | 'warn' | 'danger' {
        const severidades: any = {
            'COMUN': 'secondary',
            'POCO_COMUN': 'info',
            'RARA': 'warn',
            'EPICA': 'danger',
            'LEGENDARIA': 'help'
        };
        return severidades[rareza] || 'secondary';
    }
}
