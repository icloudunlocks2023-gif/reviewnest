import { db } from './firebase';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

// Recursively sanitize objects for Firestore (removes undefined values)
export function cleanData(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanData);
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (val !== undefined) {
          cleaned[key] = cleanData(val);
        }
      }
    }
    return cleaned;
  }
  return obj;
}

// Save a single document to Firestore
export async function saveDoc(collectionName: string, docId: string, data: any) {
  try {
    const sanitized = cleanData(data);
    await setDoc(doc(db, collectionName, docId), sanitized);
  } catch (error) {
    console.error(`Error saving doc to ${collectionName}/${docId}:`, error);
  }
}

// Delete a single document from Firestore
export async function removeDoc(collectionName: string, docId: string) {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    console.error(`Error deleting doc from ${collectionName}/${docId}:`, error);
  }
}

// Save an entire array of items to Firestore
export async function saveCollection(collectionName: string, items: any[]) {
  try {
    const promises = items.map(item => {
      if (item && item.id) {
        return saveDoc(collectionName, item.id, item);
      }
      return Promise.resolve();
    });
    await Promise.all(promises);
  } catch (error) {
    console.error(`Error saving collection ${collectionName}:`, error);
  }
}

// Load an entire collection from Firestore
export async function loadCollection(collectionName: string): Promise<any[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const items: any[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ ...doc.data() });
    });
    return items;
  } catch (error) {
    console.error(`Error loading collection ${collectionName}:`, error);
    return [];
  }
}
