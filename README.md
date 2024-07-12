# JustDeploy

[JustDeploy](https://www.youtube.com/watch?v=FUK130q-v2g) is a backend system that emulates Vercel's project deployment functionality. This project is designed as a learning exercise to enhance software engineering skills.

## Project Architecture

[View Architecture](https://app.eraser.io/workspace/XE8FA3CUUKZmg6fPrw3F?origin=share)

## Project Structure

- **api-server**: 
  - Manages API requests
  - Subscribes to redis-queue for build logs
  - Spins up a container per project on AWS

- **build-server**: 
  - Clones projects from GitHub
  - Handles build processes
  - Publishes logs to redis-queue

- **s3-reverse-proxy**: 
  - Redirects user requests to files in S3 bucket

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Docker
- AWS account with ECR and ECS set up

## Installation

1. Clone the repository:
 ```
 git clone https://github.com/git-pixel22/JustDeploy.git
 cd JustDeploy
 ```
2. Install dependencies for each service:
```
cd <service> // example: cd api-server
npm install
```

## Usage
1. Start the API server:
```
cd api-server
npm start
```
2. Start the S3 reverse proxy:
```
cd s3-reverse-proxy
npm start
```
Note: Make sure you have built and pushed the docker container image to AWS ECR, and have ECS set up correctly to use it.

# Credits

I was able to learn all this amazing stuff thanks to [Piyush Garg](https://www.youtube.com/@piyushgargdev), [Mehul Mohan](https://www.youtube.com/@mehulmpt) and [Harkirat Singh](https://www.youtube.com/@harkirat1).



