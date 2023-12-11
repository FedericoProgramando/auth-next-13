import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/libs/mongodb";
import User,{ IUser } from "@/models/User";
import { message } from "@/utils/messages";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export async function Post(req: NextRequest) {
    try {
        await connectMongoDB();
        const body: IUser = await req.json();
        const {email, password} = body;

        // Valida que esten todos los campos
        if (!email ||!password) {
            return NextResponse.json({
                status: 400,
                message: message.error.needProps,
            });
        }

        const userFind = await User.findOne({email});

        // Vemos si existe el usuario por el email del usuario
        if (!userFind) {
            return NextResponse.json({
                status: 400,
                message: message.error.userNotFound,
            });
        }

        const isCorrect : boolean = await bcrypt.compare(
            password,
            userFind.password
        );
        
        // Vemos que la contraseña sea correcta
        if (!isCorrect) {
            return NextResponse.json({
                status: 400,
                message: message.error.incorrectPassword,
            });
        }

        const { password: userPass, ...rest } = userFind._doc;

        const token = jwt.sign({ data: rest }, "secreto", {
            expiresIn: 86400,
        });

        const response = NextResponse.json(
            {userLogged: rest, message: message.success.userLogged},
            {status: 200}
        );
        response.cookies.set("auth_cookie", token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 86400,
            path: "/",
        });

        return response;
        
    } catch (err) {
        return NextResponse.json({
            status: 500,
            message: message.error.default, error: err
        });
    }
}