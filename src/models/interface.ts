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
    pairee1Id: string
    pairee2Id?: string
    laneId: string
}

export interface HistoryRecord {
    id: string
    pairs: Pair[]
    date: Date
}

export interface PairmanRecord {
    paireeId: string
    electionDate: Date
}

export interface Project {
    id: string
    name: string
    pairingStatus: PairingState
    currentPairman: PairmanRecord | null
}
