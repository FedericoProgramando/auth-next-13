import { connectMongoDB } from "@/app/libs/mongodb";
import { message } from "@/utils/messages";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const headerList = headers();
    const token = headerList.get("token");

    // Vemos que haya token
    if (!token) {
      return NextResponse.json(
        { message: message.error.notAuthorized },
        { status: 401 }
      );
    }

    try {
      const isTokenValid = jwt.verify(token, "secreto");
      //@ts-ignore
      const { data } = isTokenValid;

      await connectMongoDB();
      const userFind = await User.findById(data.userId);

      //Vemos que exista el usuario
      if (!userFind) {
        return NextResponse.json(
          { message: message.error.userNotFound },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { isAuthorized: true, message: message.success.authorized },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { message: message.error.tokenNoValid, error },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: message.error.default, error },
      { status: 500 }
    );
  }
}
