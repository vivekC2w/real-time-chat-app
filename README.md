# real-time-chat-app
A real-time chat application with WebSockets (Socket.io), PostgreSQL, Redis, and AWS S3, featuring offline message queuing, resumable media uploads, and message order correction. Built with Node.js, Express, Prisma, and React.js.

Installation & Running the Project

Backend Setup

Navigate to the backend directory:
cd backend

Install dependencies:
npm install

Create a .env file inside the backend directory and add the following:

DATABASE_URL="postgresql://chat-app_owner:npg_Fsd3eLPvni7j@ep-damp-resonance-a5i6wxzx-pooler.us-east-2.aws.neon.tech/chat-app?sslmode=require"
REDIS_URL="redis://localhost:6379"
PORT=5001
FRONTEND_URL="http://localhost:3000"
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=chat-application-uploads
REGION=us-east-1
JWT_SECRET=chat-app-secret-key

Start the backend server:
npm start

Frontend Setup

Navigate to the frontend directory:
cd frontend

Install dependencies:
npm install

Start the frontend server:
npm start



Here is the link for Documentation: https://www.notion.so/Chat-Application-1bddc6a76cd4806ea43cc6d724954ec4
