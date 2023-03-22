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

export interface RecordedPairs {
    pairs: Pair[];
    date: Date;
}

export interface Project {
    id: string;
    name: string;
    pairees: Pairee[];
    availablePairees: Pairee[];
    lanes: Lane[];
    recordedPairsHistory: RecordedPairs[];
    currentPairs: Pair[] | null;
    pairingStatus: PairingState
}
