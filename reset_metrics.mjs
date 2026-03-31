import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJ4D_QQGjyS0ym2f3nQk9888WfER5Pu6g",
  authDomain: "notes-hub-utn.firebaseapp.com",
  projectId: "notes-hub-utn",
  storageBucket: "notes-hub-utn.firebasestorage.app",
  messagingSenderId: "553245300649",
  appId: "1:553245300649:web:f3aac36259b423e5c6d6b8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const snap = await getDocs(collection(db, "metrics"));
    let count = 0;
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
      count++;
    }
    console.log(`¡Listo! Se borraron ${count} registros de métricas. El panel ahora empezará completamente desde cero.`);
    process.exit(0);
  } catch(e) {
    console.error("Error borrando:", e);
    process.exit(1);
  }
}
run();
