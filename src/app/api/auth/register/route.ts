import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/libs/mongodb";
import { isValidEmail } from "@/utils/isValidEmail";
import User, { IUserSchema } from "@/models/User";
import { message } from "@/utils/messages";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const { email, password, confirmPassword } = body;

    // Valida que esten todos los campos
    if (!email || !password || !confirmPassword) {
      return NextResponse.json({
        status: 400,
        message: message.error.needProps,
      });
    }
    // valida que el email es un email
    if (!isValidEmail(email)) {
      return NextResponse.json({
        status: 400,
        message: message.error.emailNoValid,
      });
    }
    // valida que las contraseñas sean iguales
    if (password!== confirmPassword) {
      return NextResponse.json({
        status: 400,
        message: message.error.passwordNoMatch,
      });
    }

    const userFind = await User.findOne({email});

    if (userFind) {
      return NextResponse.json({
        status: 400,
        message: message.error.emailExist,
      });
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const newUser: IUserSchema = new User ({
      email,
      password: hashPassword,
    })
    // @ts-ignore
    const {password: userPass, ...rest} = newUser._doc;

    await newUser.save();

    const token = jwt.sign({ data: rest }, "secret", {
      expiresIn: 86400,
    });

    const response = NextResponse.json({
      newUser: rest,
      message: message.success.userCreated,
    },
    {
      status: 200,
    }
    );

    response.cookies.set("auth_cookie", token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    })

    return response;
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: message.error.default, error
    });
  }
}
