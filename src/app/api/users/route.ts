import { connectMongoDB } from "@/app/libs/mongodb";
import User from "@/models/User";
import { message } from "@/utils/messages";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();
    const users = await User.find();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: message.error.default, error },
      { status: 500 }
    );
  }
}
