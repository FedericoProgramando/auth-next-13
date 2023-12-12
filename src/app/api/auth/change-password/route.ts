import { connectMongoDB } from "@/app/libs/mongodb";
import { message } from "@/utils/messages";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import bcrypt from "bcryptjs";

interface BodyProps {
  newPassword: string;
  confirmPassword: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: BodyProps = await req.json();

    const { newPassword, confirmPassword } = body;

    // Vemos que esten todos los campos
    if (newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: message.error.needProps },
        { status: 400 }
      );
    }

    await connectMongoDB();

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
      const userFind = await User.findById(data.userId);

      //Vemos que exista el usuario
      if (!userFind) {
        return NextResponse.json(
          { message: message.error.userNotFound },
          { status: 401 }
        );
      }

      // Vemos que la nueva contraseñas coincidan
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { message: message.error.passwordNoMatch },
          { status: 401 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      userFind.password = hashedPassword;

      await userFind.save();

      return NextResponse.json(
        { message: message.success.passwordChanged },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { message: message.error.tokenNoValid },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: message.error.default },
      { status: 500 }
    );
  }
}
