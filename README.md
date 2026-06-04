# WeCode
Live here : https://we-code-tau.vercel.app

WeCode is a real-time collaborative coding platform built for practicing LeetCode problems with friends. Everyone in a room gets the same set of problems, can chat, and can run or submit code directly through their own LeetCode account. Think of it as a shared coding session where you can see what problem everyone is on and vote to load new questions when the group is ready to move on.

## What WeCode does

- Loads a set of LeetCode problems for everyone in the room to work through together
- Lets you write, run, and submit code using the Monaco editor (the same editor VS Code uses)
- Shows a live list of who is in the room and which problem they are currently on
- Has a chat window so you can talk to each other while coding
- Lets anyone request a new set of questions, and the group votes to accept or reject it
- Supports Python 3, C++, Java, and JavaScript

## This works fine

The backend is a Node.js server that acts as a proxy between you and LeetCode. When you connect your LeetCode account, your session cookies are stored and used to fetch problem details and submit code on your behalf. The real-time features like chat and room presence are handled through Socket.io.

## Requirements

Before you start, make sure you have the following installed on your machine.

- Node.js version 18 or higher
- npm version 9 or higher
- A LeetCode account (you need to be logged in to run and submit code)
- An Upstash account for Redis (free tier is fine)

## LeetCode cookies

Login needs two cookies from your LeetCode session to run and submit code on your behalf. How to get them.

1. Go to leetcode.com and log in
2. Open your browser developer tools by pressing F12 or Cmd+Option+I on Mac
3. Go to the Application tab, then Cookies, then click on https://leetcode.com
4. Find the cookie named LEETCODE_SESSION and copy its value
5. Find the cookie named csrftoken and copy its value

You will paste these into the app when you first open it.

## Upstash Redis

I used Redis to store user credentials so they persist across server restarts. The free tier on Upstash is enough for running this locally or for a small group.

Go to upstash.com and create a free account

## Run on a Local Machine

Clone the repository and follow these steps.

### 1. The server

```bash
cd server
npm install
```

Create a file called `.env` inside the `server` folder with the following contents. Fill in your own values.

``` bash
HMAC_SECRET=any_long_random_string_you_make_up
UPSTASH_REDIS_REST_URL=your_upstash_rest_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token_here
PORT=3001
```

Start the server in development mode.

```bash
npx ts-node index.ts
```

The server will be running at http://localhost:3001.

### 2. The client

Open a new terminal tab and do the following.

```bash
cd client
npm install
```

Create a file called `.env` inside the `client` folder with the following contents.

``` bash
VITE_API_URL=http://localhost:3001
```
Start the frontend.

```bash
npm run dev
```

The app will be running at http://localhost:5173. Open that in your browser.

### 3. The app

When you open the app for the first time it will ask for your LeetCode session cookies. Paste in the csrftoken and LEETCODE_SESSION values you copied earlier and click Connect. The app will verify your account and take you into the room.

To test with multiple people locally, have each person open the app in their own browser, connect their own LeetCode account, and you will all appear in the same room.


## Environment variables reference

### Server

Variable : Why is it even there

HMAC_SECRET : A secret string used to sign session tokens. Make this long and random. 
UPSTASH_REDIS_REST_URL : The REST URL from your Upstash Redis database. 
UPSTASH_REDIS_REST_TOKEN : The REST token from your Upstash Redis database. 
PORT : The port the server runs on. Defaults to 3001. 
FRONTEND_URL : The URL of the frontend. Used to restrict CORS in production. 

## Notes

Your LeetCode session cookies expire periodically. If running or submitting code stops working, go to the connect page and paste in fresh cookies. The app will show a banner when your session has expired.

All rooms are currently shared in a single global room. Everyone who opens the app joins the same session, which is fine for a small group of friends but not intended for public use.
