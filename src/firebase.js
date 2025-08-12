// FILE: src/firebase.js
// --- UPDATED FILE ---
// Added a new dedicated hook to fetch the featured product.
//dd
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy as firestoreOrderBy,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { useState, useEffect } from 'react';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const useFirestore = (collectionName, options = {}) => {
  const { orderByField = 'createdAt', orderByDirection = 'desc' } = options;
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, collectionName),
          firestoreOrderBy(orderByField, orderByDirection)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }));
        setDocs(data);
      } catch (err) {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(`Failed to load ${collectionName}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, orderByField, orderByDirection]);

  return { docs, loading, error };
};

// --- NEW HOOK for fetching the single featured product ---
export const useFeaturedProduct = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProduct = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'products'),
          where('isFeatured', '==', true),
          limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const featuredDoc = querySnapshot.docs[0];
          setProduct({
            id: featuredDoc.id,
            ...featuredDoc.data(),
            createdAt: featuredDoc.data().createdAt?.toDate(),
          });
        } else {
          setProduct(null); // No featured product found
        }
      } catch (err) {
        console.error('Error fetching featured product:', err);
        setError('Could not load the featured product.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProduct();
  }, []);

  return { product, loading, error };
};
