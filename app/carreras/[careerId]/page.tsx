import { careersData } from "@/lib/data";
import { db } from "@/lib/firebase/config";
import { CareerDashboardClient } from "@/components/CareerDashboardClient";
import { collection, getDocs, query, where } from "firebase/firestore";
import { notFound } from "next/navigation";

async function getInitialNoteCounts(careerId: string) {
  const counts: Record<string, number> = {};

  try {
    const notesQuery = query(
      collection(db, "notes"),
      where("careerId", "==", careerId),
      where("status", "==", "approved")
    );
    const querySnapshot = await getDocs(notesQuery);

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const subjectId = typeof data.subjectId === "string" ? data.subjectId : "";

      if (subjectId) {
        counts[subjectId] = (counts[subjectId] || 0) + 1;
      }
    });
  } catch (error) {
    console.error("Error fetching initial note counts:", error);
  }

  return counts;
}

export default async function CareerDashboardPage({
  params,
}: {
  params: Promise<{ careerId: string }>;
}) {
  const { careerId } = await params;
  const career = careersData.find((item) => item.id === careerId);

  if (!career) {
    notFound();
  }

  const initialNoteCounts = await getInitialNoteCounts(careerId);

  return <CareerDashboardClient careerId={careerId} initialNoteCounts={initialNoteCounts} />;
}
