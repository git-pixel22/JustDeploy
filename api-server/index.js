import express from "express";
import { generateSlug } from "random-word-slugs";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import Redis from "ioredis"
import { Server } from "socket.io"

const app = express();

const PORT = 9000;

const subscriber = new Redis('<redis-queue-link>');

const io = new Server({ cors: '*' });

io.on('connection', socket => {
    socket.on('subscribe', channel => {
        socket.join(channel)
        socket.emit('message', `Joined ${channel}`)
    })
})

io.listen(9001, () => console.log(`Socket Server Running On Port ${PORT}`));

const ecsClient = new ECSClient({
    region: '',
    credentials: {
        accessKeyId: '',
        secretAccessKey: ''
    }
});

const config = {
    CLUSTER: '',
    TASK: ''
};

app.use(express.json());

app.post('/project', async (req, res) => {

    const { gitURL } = req.body;
    const projectSlug = generateSlug();

    // Run A Container On AWS ECS To Build The Project And Transfer Files To S3
    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: ['', '', ''],
                securityGroups: [''] 
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: '',
                    environment: [
                        { name: 'GIT_REPOSITORY_URL', value: gitURL },
                        { name: 'PROJECT_ID', value: projectSlug }
                    ]
                }
            ]
        }
    });

    await ecsClient.send(command);

    return res.json({ status: 'queued', data: {projectSlug, url: `http://${projectSlug}.localhost:8000`}});

})

async function initRedisSubscribe() {

    console.log("Subscribed To Logs");

    subscriber.psubscribe('logs:*');
    subscriber.on('pmessage', (pattern, channel, message) => {
        io.to(channel).emit('message', message);
    })
}

initRedisSubscribe();

app.listen(PORT, () => console.log(`API Server Running On Port ${PORT}`));