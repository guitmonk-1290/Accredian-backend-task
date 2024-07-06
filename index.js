const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const cors = require('cors')

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
})

const app = express()

// middlewares
app.use(bodyParser.json())
app.use(cors())

// routes
app.post('/submit-referral', async (req, res) => {
    const { email, text, ref_email } = req.body;

    if (text == "") {
        text = `Greetings there,\n${email} has send you a referral to join on of our courses. By joining the course, you can also earn referral rewards. Click on the link below to know more`
    }

    const ref_id = Math.random().toString(36).substring(2, 15);

    try {
        // Create a new entry in the database
        const newReferral = await prisma.Referrals.create({
            data: {
                ref_id: ref_id, // Use the generated ID
                email: email,
                text: text,
                ref_email: ref_email,
            },
        });

        console.log(newReferral)

        const oAuth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI,
        )

        oAuth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        })

        try {
            const accessToken = await oAuth2Client.getAccessToken()

            const transport = nodemailer.createTransport({
                service: "gmail",
                host: 'smtp.gmail.com',
                auth: {
                    type: "OAuth2",
                    user: process.env.AUTH_USER,
                    clientId: process.env.CLIENT_ID,
                    clientSecret: process.env.CLIENT_SECRET,
                    refreshToken: process.env.REFRESH_TOKEN,
                    accessToken: accessToken
                },
                tls: {
                    rejectUnauthorized: false,
                    servername: 'smtp.gmail.com'
                }
            })

            const mailOptions = {
                from: `${ref_email} <${process.env.AUTH_USER}>`,
                to: ref_email,
                subject: "Accredian course referral",
                text: `${text} - ${email}\nYou have been referred for a course. Click on the link to check it out!`
            }

            const result = await transport.sendMail(mailOptions)
            res.json({ message: "Referral submitted successfully!'" })

        } catch (error) {
            console.error(error)
            res.json({ error: String(error) })
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting referral!' });
    }
})

app.listen(5000, () => {
    console.log("Server listening on port 5000")
})