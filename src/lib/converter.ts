import { DocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { Lane, Pair, Pairee, Project } from "../models/interface";
import { RecordedPairs } from '../models/interface'

export const projectConverter = {
    toFirestore: (project: Project) => {
        return {
            id: project.id,
            name: project.name,
            pairingStatus: project.pairingStatus,
        }
    },
    fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
        const data  = snapshot.data(options)
        if (data) {
            return {
                id: data.id,
                name: data.name,
                pairingStatus: data.pairingStatus
                // recordedPairsHistory: data.recordedPairsHistory.map((h: any) => ({
                //     ...h,
                //     date: h.date.toDate()
                // } as RecordedPairs)),
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

export const pairConverter = {
    toFirestore: (pair: Pair) => {
        return {
            lane: pair.lane,
            pairee1: pair.pairee1,
            pairee2: pair.pairee2 || null
        }
    },
    fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
        const data = snapshot.data(options)
        if (data) {
            return {
                lane: data.lane,
                pairee1: data.pairee1,
                pairee2: data.pairee2 || undefined
            } as Pair
        }
    }
}
