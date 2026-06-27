import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  query,
  limit,
  updateDoc
} from 'firebase/firestore';
import { Product, Order, User } from './types';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Helpers for Collections
const PRODUCTS_COLL = 'products';
const ORDERS_COLL = 'orders';
const USERS_COLL = 'users';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Real-time synchronization listeners
export function subscribeToProducts(callback: (products: Product[]) => void) {
  return onSnapshot(
    collection(db, PRODUCTS_COLL),
    (snapshot) => {
      const productsList: Product[] = [];
      snapshot.forEach((docSnap) => {
        productsList.push(docSnap.data() as Product);
      });
      callback(productsList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, PRODUCTS_COLL);
    }
  );
}

export function subscribeToOrders(callback: (orders: Order[]) => void) {
  return onSnapshot(
    collection(db, ORDERS_COLL),
    (snapshot) => {
      const ordersList: Order[] = [];
      snapshot.forEach((docSnap) => {
        ordersList.push(docSnap.data() as Order);
      });
      // Sort orders by date descending (newest first)
      ordersList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(ordersList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, ORDERS_COLL);
    }
  );
}

export function subscribeToUsers(callback: (users: User[]) => void) {
  return onSnapshot(
    collection(db, USERS_COLL),
    (snapshot) => {
      const usersList: User[] = [];
      snapshot.forEach((docSnap) => {
        usersList.push(docSnap.data() as User);
      });
      callback(usersList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, USERS_COLL);
    }
  );
}

// Check and seed databases if empty
export async function seedDatabaseIfEmpty(initialProducts: Product[], defaultUsers: User[]) {
  try {
    const productsQuery = query(collection(db, PRODUCTS_COLL), limit(1));
    const productsSnap = await getDocs(productsQuery);
    
    if (productsSnap.empty) {
      console.log('Seeding products to Firestore...');
      const batch = writeBatch(db);
      initialProducts.forEach((product) => {
        const docRef = doc(db, PRODUCTS_COLL, product.id);
        batch.set(docRef, product);
      });
      await batch.commit();
    }

    const usersQuery = query(collection(db, USERS_COLL), limit(1));
    const usersSnap = await getDocs(usersQuery);

    if (usersSnap.empty) {
      console.log('Seeding default users to Firestore...');
      const batch = writeBatch(db);
      defaultUsers.forEach((user) => {
        const docRef = doc(db, USERS_COLL, user.id);
        batch.set(docRef, user);
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'seed-check');
  }
}

// Direct mutation operations to write to Firestore
export async function saveProductToFirestore(product: Product) {
  try {
    await setDoc(doc(db, PRODUCTS_COLL, product.id), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PRODUCTS_COLL}/${product.id}`);
  }
}

export async function deleteProductFromFirestore(productId: string) {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLL, productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLL}/${productId}`);
  }
}

export async function saveOrderToFirestore(order: Order) {
  try {
    await setDoc(doc(db, ORDERS_COLL, order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ORDERS_COLL}/${order.id}`);
  }
}

export async function updateOrderStatusInFirestore(orderId: string, status: 'Pending' | 'Delivered' | 'Cancelled') {
  try {
    const docRef = doc(db, ORDERS_COLL, orderId);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ORDERS_COLL}/${orderId}`);
  }
}

export async function deleteOrderFromFirestore(orderId: string) {
  try {
    await deleteDoc(doc(db, ORDERS_COLL, orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ORDERS_COLL}/${orderId}`);
  }
}

export async function saveUserToFirestore(user: User) {
  try {
    await setDoc(doc(db, USERS_COLL, user.id), user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USERS_COLL}/${user.id}`);
  }
}

export async function resetOrdersInFirestore() {
  try {
    const ordersSnap = await getDocs(collection(db, ORDERS_COLL));
    const batch = writeBatch(db);
    ordersSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, ORDERS_COLL);
  }
}

export async function resetSystemInFirestore(initialProducts: Product[], defaultUsers: User[]) {
  try {
    // Reset products
    const productsSnap = await getDocs(collection(db, PRODUCTS_COLL));
    let batch = writeBatch(db);
    productsSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();

    // Reset orders
    const ordersSnap = await getDocs(collection(db, ORDERS_COLL));
    batch = writeBatch(db);
    ordersSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();

    // Reset users
    const usersSnap = await getDocs(collection(db, USERS_COLL));
    batch = writeBatch(db);
    usersSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();

    // Reseed defaults
    await seedDatabaseIfEmpty(initialProducts, defaultUsers);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'system-reset');
  }
}
