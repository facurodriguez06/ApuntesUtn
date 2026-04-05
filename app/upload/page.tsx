import { UploadModule } from "@/components/UploadModule";
import { Suspense } from "react";

export default async function UploadPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const materiaQuery = typeof resolvedParams.materia === 'string' ? resolvedParams.materia : 'default';
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      <Suspense fallback={<div>Cargando módulo de subida...</div>}>
        <UploadModule key={materiaQuery} />
      </Suspense>
    </div>
  );
}
