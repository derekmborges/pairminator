import { PairingState } from "./enum"

export interface Pairee {
    id: string
    name: string
    available: boolean
    active: boolean
}

export interface Lane {
    id: string
    name: string
    number: number
}

export interface Pair {
    // id: string
    pairee1: Pairee
    pairee2?: Pairee
    lane: Lane
}

export interface RecordedPairs {
    id: string
    pairs: Pair[]
    date: Date
}

export interface Project {
    id: string
    name: string
    pairingStatus: PairingState
    pairees?: Pairee[]
    // availablePairees: Pairee[]
    lanes?: Lane[]
    recordedPairsHistory?: RecordedPairs[]
    currentPairs?: Pair[]
}
