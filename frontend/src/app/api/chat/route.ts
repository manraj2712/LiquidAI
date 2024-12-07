import { callApi } from "@/helpers/axios";
import { parseAiResponse } from "@/services/ai/parseResponse";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { chatId, message } = await request.json();
    const response = await callApi({
      url: "http://localhost:8000/chat",
      options: {
        method: "POST",
        data: {
          session_id: chatId,
          message,
        },
      },
    });
    console.log({ response });
    return NextResponse.json(parseAiResponse(response), { status: 200 });
  } catch (error) {
    console.error("Error while fetching response from ai", error);
    return NextResponse.json(
      {
        error,
      },
      { status: 500 }
    );
  }
}
