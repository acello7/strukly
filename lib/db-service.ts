import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  increment,
  limit,
  startAfter,
  DocumentSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { Receipt, UserProfile, RevenueStats } from "./types";

// Receipt operations
export async function createReceipt(receipt: Omit<Receipt, "id" | "createdAt" | "updatedAt">) {
  // Use Firestore Timestamp for createdAt/updatedAt (better for queries/indexes)
  const now = Timestamp.now();
  const receiptData = {
    ...receipt,
    createdAt: now,
    updatedAt: now,
  };

  // Use a batched write to reduce round-trips and make the write more efficient.
  const receiptsCol = collection(db, "receipts");
  const receiptRef = doc(receiptsCol); // auto-id

  const userRef = doc(db, "users", receipt.userId);
  const batch = writeBatch(db);
  batch.set(receiptRef, receiptData);
  batch.update(userRef, {
    totalReceipts: increment(1),
    totalRevenue: increment(receipt.totalAmount),
  });

  await batch.commit();

  return { id: receiptRef.id, ...receiptData };
}

export async function getReceipt(receiptId: string): Promise<Receipt | null> {
  const receiptRef = doc(db, "receipts", receiptId);
  const receiptSnap = await getDoc(receiptRef);

  if (receiptSnap.exists()) {
    const data = receiptSnap.data();
    return { ...data, id: receiptSnap.id } as Receipt;
  }

  return null;
}

export async function getUserReceipts(
  userId: string,
  limitCount: number = 50,
  lastDoc?: DocumentSnapshot
): Promise<{ receipts: Receipt[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, "receipts"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  if (lastDoc) {
    q = query(
      collection(db, "receipts"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(limitCount)
    );
  }

  const querySnapshot = await getDocs(q);
  const receipts = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Receipt[];

  const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

  return { receipts, lastDoc: lastVisible };
}

export async function updateReceipt(receiptId: string, updates: Partial<Receipt>) {
  const receiptRef = doc(db, "receipts", receiptId);
  const oldReceipt = await getDoc(receiptRef);

  if (!oldReceipt.exists()) {
    throw new Error("Receipt not found");
  }

  const oldData = oldReceipt.data() as Receipt;
  const updatedData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(receiptRef, updatedData);

  // Update user's total revenue if amount changed
  if (updates.totalAmount !== undefined && updates.totalAmount !== oldData.totalAmount) {
    const difference = updates.totalAmount - oldData.totalAmount;
    const userRef = doc(db, "users", oldData.userId);
    await updateDoc(userRef, {
      totalRevenue: increment(difference),
    });
  }

  return { id: receiptId, ...oldData, ...updatedData };
}

export async function deleteReceipt(receiptId: string) {
  const receiptRef = doc(db, "receipts", receiptId);
  const receiptSnap = await getDoc(receiptRef);

  if (!receiptSnap.exists()) {
    throw new Error("Receipt not found");
  }

  const receiptData = receiptSnap.data() as Receipt;

  await deleteDoc(receiptRef);

  // Update user's total receipts and revenue
  const userRef = doc(db, "users", receiptData.userId);
  await updateDoc(userRef, {
    totalReceipts: increment(-1),
    totalRevenue: increment(-receiptData.totalAmount),
  });
}

// User operations
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }

  return null;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, updates);
}

// Revenue statistics
export async function getRevenueStats(userId: string, startDate?: Date, endDate?: Date): Promise<RevenueStats> {
  let q = query(collection(db, "receipts"), where("userId", "==", userId), orderBy("date", "desc"));

  if (startDate && endDate) {
    q = query(
      collection(db, "receipts"),
      where("userId", "==", userId),
      where("date", ">=", startDate.toISOString().split("T")[0]),
      where("date", "<=", endDate.toISOString().split("T")[0]),
      orderBy("date", "desc")
    );
  }

  const querySnapshot = await getDocs(q);
  const receipts = querySnapshot.docs.map((doc) => doc.data()) as Receipt[];

  const totalRevenue = receipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);
  const totalReceipts = receipts.length;
  const averageTransaction = totalReceipts > 0 ? totalRevenue / totalReceipts : 0;

  const monthlyRevenue: { [key: string]: number } = {};
  const dailyRevenue: { [key: string]: number } = {};
  const categoryBreakdown: { [key: string]: number } = {};

  receipts.forEach((receipt) => {
    const date = new Date(receipt.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const dayKey = receipt.date;

    monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + receipt.totalAmount;
    dailyRevenue[dayKey] = (dailyRevenue[dayKey] || 0) + receipt.totalAmount;

    if (receipt.category) {
      categoryBreakdown[receipt.category] = (categoryBreakdown[receipt.category] || 0) + receipt.totalAmount;
    }
  });

  return {
    totalRevenue,
    totalReceipts,
    averageTransaction,
    monthlyRevenue,
    dailyRevenue,
    categoryBreakdown,
  };
}

// Search receipts
export async function searchReceipts(userId: string, searchTerm: string): Promise<Receipt[]> {
  const q = query(collection(db, "receipts"), where("userId", "==", userId), orderBy("createdAt", "desc"));

  const querySnapshot = await getDocs(q);
  const receipts = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Receipt[];

  // Client-side filtering for search
  return receipts.filter(
    (receipt) =>
      receipt.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
}
