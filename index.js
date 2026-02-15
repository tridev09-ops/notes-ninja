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

// Use built-in middleware to parse the body
app.use(express.json()); // For JSON-encoded bodies
app.use(express.urlencoded({
    extended: true
})); // For URL-encoded form data

const port = process.env.PORT
const session_str = process.env.SESSION_STR
const apiId = parseInt(process.env.API_ID)
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
    // console.log(client.session.save()) // Save session string to avoid logging in again
})()

app.get("/", async(req, res)=> {
    res.send("home page")
})

app.get("/download/:filename", async (req, res) => {
    const filename = req.params.filename
    
    const messages = await client.getMessages("me", {
        limit: 1,
        search: filename
    });
    console.log(messages)

    const fileName = messages[0].file.name || "file.pdf";
    const media = messages[0].media;

    // Set headers so the browser knows it's a PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Use GramJS iterDownload to stream chunks
    for await (const chunk of client.iterDownload({
        file: media, requestSize: 1024 * 1024, // 1MB chunks
        workers: 4 // 4 parallel streams
    })) {
        res.write(chunk); // Send each chunk to the browser as it arrives
    }
    res.end(); // Done!
});


app.get("/upload/:filename", async(req, res)=> {
    const filename = req.params.filename

    // upload file to telegram
    await client.sendFile("me", {
        file: `./${filename}.pdf`, // Path to your file in Termux
        caption: filename,
        forceDocument: true, // Ensures it's sent as a file, not a preview
    })
    r
    console.log("PDF uploaded successfully!")
    res.send("PDF uploaded successfully!")

    // error handling
    console.error(err.stack); // Log the error for debugging
    res.status(err.status || 500).send('Something broke!'); // Send a generic error response
})

app.listen(port, ()=> {
    console.log(`App is running on http//localhost:${port}`)
})