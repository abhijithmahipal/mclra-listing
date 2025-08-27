import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "mclra-eb016",
  appId: "1:835863133405:web:2266186b0c6da0db8aef34",
  storageBucket: "mclra-eb016.firebasestorage.app",
  apiKey: "AIzaSyDx0odY7HpPmml6l4pIVE4sSRq8Jicg2b8",
  authDomain: "mclra-eb016.firebaseapp.com",
  messagingSenderId: "835863133405",
  measurementId: "G-4C5JMMTM38",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
