import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "profiles";

export const profilesService = {
  async getAll() {
    const snapshot = await getDocs(collection(db, COLLECTION));
    // Sort locally instead of using orderBy (avoids needing Firestore index)
    const profiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return profiles.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
  },

  async create(profile) {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...profile,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...profile };
  },

  async update(id, data) {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, data);
  },

  async delete(id) {
    await deleteDoc(doc(db, COLLECTION, id));
  }
};
