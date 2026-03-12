import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../config/firebase";

export const FirestoreService = {
  // Generic CRUD
  async add(coll, data) {
    try {
      const docRef = await addDoc(collection(db, coll), {
        ...data,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...data };
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e;
    }
  },

  async getAll(coll, q_params = []) {
    const q = query(collection(db, coll), ...q_params);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getById(coll, id) {
    const docRef = doc(db, coll, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  },

  async update(coll, id, data) {
    const docRef = doc(db, coll, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(coll, id) {
    const docRef = doc(db, coll, id);
    await deleteDoc(docRef);
  },

  // Specific helpers
  async getProducts() {
    return this.getAll("products", [orderBy("createdAt", "desc")]);
  },

  async getCustomers() {
    return this.getAll("customers", [orderBy("createdAt", "desc")]);
  },

  async getOrders() {
    return this.getAll("orders", [orderBy("createdAt", "desc")]);
  }
};
