import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();
    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      console.error("No se encontró MP_ACCESS_TOKEN en las variables de entorno");
      return NextResponse.json(
        { error: "Error de configuración de servidor" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: "Donacion UTNHub",
            quantity: 1,
            unit_price: Number(amount),
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin}`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin}`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin}`,
        },

      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error de Mercado Pago API:", data);
      return NextResponse.json(
        { error: data.message || "Error al generar la preferencia" },
        { status: response.status }
      );
    }

    return NextResponse.json({ url: data.init_point });
  } catch (error) {
    console.error("Error crítico en checkout:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
