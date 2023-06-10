import { DocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { Lane, Pair, Pairee, PairmanRecord, Project } from "../models/interface";
import { HistoryRecord } from '../models/interface'

export const projectConverter = {
    toFirestore: (project: Project) => {
        return {
            id: project.id,
            name: project.name,
            pairingStatus: project.pairingStatus,
            currentPairman: project.currentPairman,
        }
    },
    fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
        const data  = snapshot.data(options)
        if (data) {
            return {
                id: data.id,
                name: data.name,
                pairingStatus: data.pairingStatus,
                currentPairman: data.currentPairman
                    ? {
                        paireeId: data.currentPairman.paireeId,
                        electionDate: data.currentPairman.electionDate.toDate(),
                    } as PairmanRecord
                    : null
            } as Project
        }
    }
}

export const paireeConverter = {
    toFirestore: (pairee: Pairee) => {
        return {
            id: pairee.id,
            name: pairee.name,
            available: pairee.available,
            active: pairee.active
        }
    },
    fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
        const data = snapshot.data(options)
        if (data) {
            return {
                id: data.id,
                name: data.name,
                available: data.available,
                active: data.active
            } as Pairee
        }
    }
}

export const laneConverter = {
    toFirestore: (lane: Lane) => {
        return {
            id: lane.id,
            name: lane.name,
            number: lane.number
        }
    },
    fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
        const data = snapshot.data(options)
        if (data) {
            return {
                id: data.id,
                name: data.name,
                number: data.number
            } as Lane
        }
    }
}

const transformDataToPair = (data: any): Pair => {
    return {
        id: data.id,
        laneId: data.laneId,
        pairee1Id: data.pairee1Id,
        pairee2Id: data.pairee2Id || undefined
    } as Pair
}

const transformPairToData = (pair: Pair): any => {
    return {
        laneId: pair.laneId,
        pairee1Id: pair.pairee1Id,
        pairee2Id: pair.pairee2Id || null
    }
}

export const pairConverter = {
    toFirestore: (pair: Pair) => {
        return transformPairToData(pair)
    },
    fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
        const data = snapshot.data(options)
        if (data) {
            return transformDataToPair(data)
        }
    }
}

export const historyRecordConverter = {
    toFirestore: (historyRecord: HistoryRecord) => {
        return {
            id: historyRecord.id,
            pairs: historyRecord.pairs.map(pair => transformPairToData(pair)),
            date: historyRecord.date,
        }
    },
    fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
        const data = snapshot.data(options)
        if (data) {
            return {
                id: data.id,
                pairs: data.pairs.map((pair: any) => transformDataToPair(pair)),
                date: data.date.toDate()
            } as HistoryRecord
        }
    }
}
