import { DocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { Project } from "../models/interface";

export const projectConverter = {
    toFirestore: (project: Project) => {
        return {
            projectId: project.id,
            projectName: project.name,
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
                id: data.projectId,
                name: data.projectName,
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