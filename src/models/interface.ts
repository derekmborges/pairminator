import { PairingState } from "./enum";

export interface Pairee {
    id: number;
    name: string;
}

export interface Lane {
    id: number;
    name: string
}

export interface Pair {
    pairee1: Pairee;
    pairee2?: Pairee;
    lane: Lane;
}

export interface Assignment {
    pairs: Pair[];
    date: Date;
}

export interface Project {
    id: string;
    name: string;
    password: string;
    pairees: Pairee[];
    availablePairees: Pairee[];
    lanes: Lane[];
    history: Assignment[];
    currentPairs: Pair[] | null;
    pairingStatus: PairingState
}
