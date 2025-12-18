import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: "Progresso salvato",
      moduleId: params.moduleId,
      data: body
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Errore interno",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}