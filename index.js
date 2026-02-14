import {
    TelegramClient
} from "telegram"
import {
    StringSession
} from "telegram/sessions/index.js"
import readline from "readline"
import dotenv from "dotenv"
import express from "express"

const app = express()
dotenv.config()

const port = process.env.PORT
const session_str = process.env.SESSION_STR
const apiId = process.env.API_ID
const apiHash = process.env.API_HASH

const stringSession = new StringSession(session_str) // fill this later with the value from session.save()

// create input output interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

let client;

(async () => {
    client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    })
    // login part for admin
    await client.start({
        phoneNumber: async () =>
        new Promise((resolve) =>
            rl.question("Please enter your number: ", resolve)
        ),
        password: async () =>
        new Promise((resolve) =>
            rl.question("Please enter your password: ", resolve)
        ),
        phoneCode: async () =>
        new Promise((resolve) =>
            rl.question("Please enter the code you received: ", resolve)
        ),
        onError: (err) => console.log(err),
    })
    console.log("You should now be connected.")
    console.log(client.session.save()) // Save session string to avoid logging in again
    /*const filename = async () =>
        new Promise((resolve) =>
            rl.question("Enter the file name: ", resolve)
    )*/
})()

// upload file to telegram
client.sendFile("me", {
    file: async () =>
    new Promise((resolve) =>
        rl.question("Enter the file name: ", resolve)
    ), // Path to your file in Termux
    caption: "hello",
    forceDocument: true, // Ensures it's sent as a file, not a preview
    onError: (err) => console.log(err),
})

/*
app.get("/upload/:filename", async(req, res)=> {
    const filename = req.params.filename
    const filename = async () =>
        new Promise((resolve) =>
            rl.question("Enter the file name: ", resolve)
    ),
    // upload file to telegram
    await client.sendFile("me", {
        file: `./${filename}`, // Path to your file in Termux
        caption: filename,
        forceDocument: true, // Ensures it's sent as a file, not a preview
    })

    console.log("PDF uploaded successfully!")
})

app.listen(port, ()=> {
    console.log(`App is running on localhost:${port}`)
})
*/