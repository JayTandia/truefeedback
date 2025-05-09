import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbConnect()
    try {
        const {email, username, password} = await request.json()
        const exsistingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if(exsistingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, {status: 400})
        }

        const exsistingUserByEmail = await UserModel.findOne({email})
        const verifiyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if(exsistingUserByEmail){
            if(exsistingUserByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: "User already exsits with this email"
                }, {status: 400})
            } else{
                const hashedPassword = await bcrypt.hash(password, 10)
                exsistingUserByEmail.password = hashedPassword
                exsistingUserByEmail.verifyCode = verifiyCode
                exsistingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)

                await exsistingUserByEmail.save()
            }

        } else{
            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifiyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save()
        }

        //send verification email
        const emailResponse = await sendVerificationEmail(
            username,
            email,
            verifiyCode
        )

        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {status: 500})
        }

        return Response.json({
            success: true,
            message: "User registered successfully. Please verify your email"
        }, {status: 201})
        
    } catch (error) {
        console.error('Error registring user', error)
        return Response.json({
            success: false,
            message: 'Error registring user'
        }, {
            status: 500,
        })
    }
}