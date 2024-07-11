import { exec } from "child_process";
import path from "path";
import fs from "fs";
import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import mime from "mime-types"
import { fileURLToPath } from 'url';
import Redis from "ioredis"

const publisher = new Redis('<redis-queue-link>')

function publishLog(log) {
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({ log }))

}

const s3Client = new S3Client({
    region: '',
    credentials: {
        accessKeyId: '',
        secretAccessKey: ''
    }
})

const PROJECT_ID = process.env.PROJECT_ID;

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {

    console.log("Executing Script.js");

    publishLog(`Build Started For ${PROJECT_ID}`);

    const outputDirPath = path.join(__dirname, 'output');

    // Build The Project
    const p = exec(`cd ${outputDirPath} && npm install && npm run build`);

    // Fetch Build Logs
    p.stdout.on('data', function(data) {
        console.log(data.toString());
        publishLog(data.toString());
    })

    p.stdout.on('error', function(data) {
        console.log("ERROR: ", data.toString());
        publishLog("ERROR: ", data.toString())
    })

    p.on('close', async function() {

        console.log("Build Process Completed!!");

        publishLog("Build Process Completed!!");

        const distFolderPath = path.join(__dirname, 'output', 'dist');

        publishLog("Upload To Cloud Started");

        // Read Project Files
        const distFolderContent = fs.readdirSync(distFolderPath, {recursive: true});

        for (const file of distFolderContent) {
            const filePath = path.join(distFolderPath, file);
            if(fs.lstatSync(filePath).isDirectory())
                continue;
            
            // Else upload the file to S3

            console.log(`Uploading ${file}`);
            publishLog(`Uploading ${file}`);

            const command = new PutObjectCommand({
                Bucket: 'justdeploy-bucket',
                Key: `__outputs/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath),
            });

            await s3Client.send(command);

            console.log(`Uploaded ${file}`);
            publishLog(`Uploaded ${file}`);
        }

        console.log("Script Execution Completed");
        publishLog("Done!!");
        process.exit(0);

    })
}

init()