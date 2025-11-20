import { CategoriasCultural } from '@/models/juego.model';

class CriterioDesbloqueo {}

export interface Insignia {
    id: number;
    nombre: string;
    nombreKichwa: string;
    descripcion: string;
    icono: string;
    categoria: CategoriasCultural;
    rareza: Rareza;
    criterio: CriterioDesbloqueo;
    desbloqueada: boolean;
    fechaDesbloqueo?: Date;
}

export enum Rareza {
    COMUN = 'COMUN',
    RARO = 'RARO',
    EPICO = 'EPICO',
    LEGENDARIO = 'LEGENDARIO'
}
