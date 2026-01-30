import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// إعدادات Firebase الخاصة بك
const firebaseConfig = {
  apiKey: "AIzaSyC7_cH4FYnBwq4P9pV7uUplqOs2CTRxM5s",
  authDomain: "blog-test-f268a.firebaseapp.com",
  projectId: "blog-test-f268a",
  storageBucket: "blog-test-f268a.firebasestorage.app",
  messagingSenderId: "210834026579",
  appId: "1:210834026579:web:3eaf4bf286f6c18b4bd6a6"
};

// 1. تشغيل التطبيق
const app = initializeApp(firebaseConfig);

// 2. تشغيل نظام الـ Auth
const auth = getAuth(app);

// 3. تشغيل قاعدة البيانات Firestore
const db = getFirestore(app);

// تصدير الأدوات لاستخدامها في باقي الصفحات
export { auth, db };