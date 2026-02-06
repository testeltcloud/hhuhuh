import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "items";

export const itemsService = {
  async getByProfile(profileId) {
    const q = query(
      collection(db, COLLECTION), 
      where("profileId", "==", profileId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async create(item) {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...item,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...item, status: "pending" };
  },

  async update(id, data) {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async updateStatus(id, status) {
    const docRef = doc(db, COLLECTION, id);
    const updateData = {
      status,
      updatedAt: serverTimestamp()
    };
    if (status === "purchased") {
      updateData.purchasedAt = serverTimestamp();
    }
    await updateDoc(docRef, updateData);
  },

  async delete(id) {
    await deleteDoc(doc(db, COLLECTION, id));
  }
};
