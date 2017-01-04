# chat-task
A real-time chat application.

## CODE CHALLENGE K.LAB

- This is a code challenge proposed by K.Lab.

## Description

- The task is to create a chat-system backend in nodeJS. 

- Upon data sent from a client to any of the backends, the data should be pushed to all other clients connected to that channel.

- Upon connection of a client to a channel, the backend should send the last 10 messages to that client.

### I made sure

- clients only get messages for their specified channel.

- all messages persist in redis for 24h.

- (not pretty sure of this one) the system is horizontally scalable

### Some rough tech spec

- Use the barebones client  you can clone the from here: https://github.com/Klab-Berlin/backendTestClient

- Use redis (http://redis.io/documentation) as a database to store the messages for 24h.

- Use this base lib and wrapper for websockets:

   -(https://github.com/Klab-Berlin/r2d2)

   -(https://github.com/theturtle32/WebSocket-Node)

- A message has channel, author, text, timestamp fields.

- I used a few node-libs : websocket, redis, finalhandler, serve-static


### Goal

- Solving the data sync problem.

- The architecture I opted for is client-server architecture. And used redis to store the messages in a sorted set.
- The advantage of WebSocket is two way communication. When one user sends a message (client -> server) then server sends that message to all conected users (server -> client).
- For client -> server communication I used simple text (UTF8Data).
- For server -> client I distinguished between 2 different types of message:
 server sends messages history
 server sends messages to users in the same channel
- Therefore every message is a simple JavaScript object (JSON).

### Setup 
- Clone the repository

    ```
    git clone 

    cd test_K.Lab/TestServer

- Install node libs
    ```
	npm install
    ```
- Run the script

    ```
    node index.js //or nodemon index.js  to automatically restart the server upon changes
    ```	

### Submitting

The basic function that is working is opening 2 browser windows (chromium Version 53.0.2785.143, firefox version 50.0) and chat.
