"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export function LiveNotesCount({ initialCount = 0 }: { initialCount?: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const notesQuery = query(collection(db, "notes"), where("status", "==", "approved"));

    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        setCount(snapshot.size);
      },
      (error) => {
        console.error("Error syncing notes count:", error);
      }
    );

    return unsubscribe;
  }, []);

  return <>{count}</>;
}
