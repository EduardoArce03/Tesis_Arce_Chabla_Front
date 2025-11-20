import { CategoriasCultural } from '@/models/juego.model';

class ElementoInteractivo {}

export interface NarrativaGenerada {
    id: number;
    imagenUrl: string;
    textoGenerado: string;
    contexto: ContextoCultural;
    audioNarracion?: string;
    elementosInteractivos: ElementoInteractivo[];
    relacionadoCon: string[]; // IDs de otros contenidos relacionados
}

export interface ContextoCultural {
    categoria: CategoriasCultural;
    periodo: string;
    ubicacion: string;
    personajes?: string[];
    conceptosClave: string[];
}
