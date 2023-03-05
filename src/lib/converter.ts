import { DocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { Project } from "../models/interface";

export const projectConverter = {
    toFirestore: (project: Project) => {
        return {
            id: project.id,
            name: project.name,
            password: project.password,
            pairees: project.pairees,
            availablePairees: project.availablePairees,
            lanes: project.lanes,
            history: project.history,
            currentPairs: project.currentPairs,
            pairingStatus: project.pairingStatus,
        }
    },
    fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
        const data  = snapshot.data(options);
        if (data) {
            return {
                id: data.id,
                name: data.name,
                password: data.password,
                pairees: data.pairees,
                availablePairees: data.availablePairees,
                lanes: data.lanes,
                history: data.history,
                currentPairs: data.currentPairs,
                pairingStatus: data.pairingStatus
            } as Project
        }
    }
}