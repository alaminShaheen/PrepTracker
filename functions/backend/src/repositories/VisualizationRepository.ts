import { getDatabaseInstance } from "../database";
import { CollectionReference, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { DATABASE_CONSTANTS } from "@/constants/databaseConstants";
import { HeatmapEntry } from "@/models/HeatmapEntry";

const firestoreVisualizationConverter = {
    toFirestore: function(heatmap: HeatmapEntry) {
        return Object.assign({}, heatmap);
    },
    fromFirestore: function(snapshot: QueryDocumentSnapshot) {
        const data = snapshot.data() as HeatmapEntry;
        return new HeatmapEntry(data);
    }
};

function getVisualizationTable() {
    try {
        const databaseInstance = getDatabaseInstance();
        return databaseInstance.collection(DATABASE_CONSTANTS.VISUALIZATION_TABLE).withConverter(firestoreVisualizationConverter) as CollectionReference<HeatmapEntry, HeatmapEntry>;
    } catch (error) {
        throw error;
    }
}

async function getVisualizationWithIdSnapshot(id: string) {
    try {
        const visualizationsTable = getVisualizationTable();
        return await visualizationsTable.where("id", "==", id).get();
    } catch (error) {
        throw error;
    }
}

async function getVisualizationSnapshot(dateKey: string, userId: string) {
    try {
        const visualizationsTable = getVisualizationTable();
        return await visualizationsTable.where("userId", "==", userId).where("dateKey", "==", dateKey).get();
    } catch (error) {
        throw error;
    }
}

async function getAllUserVisualizations(userId: string): Promise<HeatmapEntry[]> {
    try {
        const visualizationsTable = getVisualizationTable();
        const visualizationSnapshot = await visualizationsTable.where("userId", "==", userId).get();
        return visualizationSnapshot.docs.map(doc => doc.data());
    } catch (error) {
        throw error;
    }
}

async function updateVisualization(visualizationData: HeatmapEntry): Promise<HeatmapEntry> {
    try {
        const visualizationsTable = getVisualizationTable();
        const visualizationSnapshot = await visualizationsTable.where("id", "==", visualizationData.id).get();
        const prevData = visualizationSnapshot.docs[0].data();

        await visualizationSnapshot.docs[0].ref.update({ ...prevData, ...visualizationData });
        const updatedVisualizationSnapshot = await visualizationSnapshot.docs[0].ref.get();
        return updatedVisualizationSnapshot.data() as HeatmapEntry;
    } catch (error) {
        throw error;
    }
}

async function createVisualization(visualizationData: HeatmapEntry): Promise<HeatmapEntry> {
    try {
        const visualizationsTable = getVisualizationTable();
        await visualizationsTable.add(visualizationData);
        return visualizationData;
    } catch (error) {
        throw error;
    }
}

export const VisualizationRepository = {
    getAllUserVisualizations,
    createVisualization,
    getVisualizationSnapshot,
    getVisualizationTable,
    updateVisualization,
    getVisualizationWithIdSnapshot
};