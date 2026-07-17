import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBEmMjEUttgXWWVJzrUzfFgGzIVG2ZEVv0",
  authDomain: "quiz-480fe.firebaseapp.com",
  projectId: "quiz-480fe",
  storageBucket: "quiz-480fe.firebasestorage.app",
  messagingSenderId: "147037541224",
  appId: "1:147037541224:web:5b7f973dc18068072c7cdd"
};

const firebaseConfigS = {
  apiKey: "AIzaSyCExjrAYoFRCByaF-29jD_JQ87n29KiKOE",
  authDomain: "cnxfirejs.firebaseapp.com",
  projectId: "cnxfirejs",
  storageBucket: "cnxfirejs.firebasestorage.app",
  messagingSenderId: "1070868264472",
  appId: "1:1070868264472:web:c94977304a67f29acef56d"
};

const app = initializeApp(firebaseConfig, 'quiz-app');
const db = getFirestore(app);
const auth = getAuth(app);

const appS = initializeApp(firebaseConfigS, 'cnx-app');
const dbS = getFirestore(appS);
const auth2 = getAuth(appS);

export {
  db,    
  auth,  
  dbS,   
  auth2  
};