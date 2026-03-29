export const runtime = "nodejs";

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

export async function POST(request: Request) {
  try {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      return Response.json(
        { error: "Cloudinary no está configurado en el servidor." },
        { status: 500 }
      );
    }

    const incomingFormData = await request.formData();
    const file = incomingFormData.get("file");
    const title = incomingFormData.get("title");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "No se recibió ningún archivo válido." },
        { status: 400 }
      );
    }

    const safeTitle =
      typeof title === "string" && title.trim().length > 0
        ? title.trim()
        : file.name.replace(/\.[^/.]+$/, "");

    const publicId = `${Date.now()}-${safeTitle.replace(/\s+/g, "-").toLowerCase()}`;
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append(
      "file",
      new Blob([await file.arrayBuffer()], { type: file.type || "application/octet-stream" }),
      file.name
    );
    cloudinaryFormData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    cloudinaryFormData.append("folder", "notes");
    cloudinaryFormData.append("public_id", publicId);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    const result = (await response.json().catch(() => null)) as CloudinaryUploadResponse | null;

    if (!response.ok) {
      return Response.json(
        { error: result?.error?.message || "No se pudo subir el archivo a Cloudinary." },
        { status: 502 }
      );
    }

    if (!result?.secure_url) {
      return Response.json(
        { error: "Cloudinary no devolvió una URL para el archivo." },
        { status: 502 }
      );
    }

    return Response.json({ url: result.secure_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado al subir el archivo.";
    return Response.json({ error: message }, { status: 500 });
  }
}

