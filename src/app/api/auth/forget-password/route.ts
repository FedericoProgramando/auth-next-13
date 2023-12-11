import { connectMongoDB } from "@/app/libs/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { message } from "@/utils/messages";
import { Resend } from "resend";
import User from "@/models/User";
import  jwt  from "jsonwebtoken";

const resend = new Resend("re_RxpxPtSN_8b85CowY7diWXc2qeQM2xqnh");

export async function POST(req: NextRequest) {
    try {
        const body: { email: string } = await req.json();

        const {email} = body

        await connectMongoDB();
        const userFind = await User.findOne({email});

        // valida que el usuario existe
        if (userFind) {
            return NextResponse.json({
                status: 400,
                message: message.error.userNotFound,
            });
        }

        const tokenData = {
            email: userFind.email,
            userId: userFind._Id,
        };

        const token = jwt.sign({ data: tokenData }, "secreto", {
            expiresIn: 86400,
        });

        const forgetUrl = `https://localhost:3000/change-password?token=${token}`;

        // @ts-ignore
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: userFind.email,
            subject: "Recuperación de contraseña",
            html: `<h1>Recuperación de contraseña</h1>
            <p>Para recuperar su contraseña, haga click en el siguiente enlace:</p>
            <a href="${forgetUrl}">Recuperar contraseña</a>`,
        });

        return NextResponse.json(
            { message: message.success.emailSend },
            { status: 200 },
        )
    } catch (error) {
        return NextResponse.json({
            status: 500,
            message: message.error.default, error
        });
    }
}