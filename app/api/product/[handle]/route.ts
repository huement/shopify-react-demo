import { NextResponse } from "next/server";
import { client } from "@/lib/shopify/serverClient";
import { getProductByHandle } from "@/lib/shopify/graphql/query";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  if (!handle) {
    return NextResponse.json({ error: "Missing handle" }, { status: 400 });
  }
  
  try {
    const resp = await client.request(getProductByHandle, {
      variables: { handle },
    });
    const product = resp.data?.productByHandle ?? null;
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" }, 
      { status: 500 }
    );
  }
}
