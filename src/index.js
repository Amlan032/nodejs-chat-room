const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const {generateMessage} = require("./utils/messages.js")
const {addUser, getUserById, getUsersInRoom, removeUser} = require("./utils/users.js")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, "../public")

app.use(express.json())
app.use(express.static(publicDirectoryPath))

io.on("connection", (socket) => {
    //joining rooms
    socket.on("join", ({username, room}, ackCallback) => {
        const {error, user} = addUser({id : socket.id, username, room})
        if(error){
            ackCallback(error)
            return
        }
        socket.join(user.room)
        socket.emit("displayMsg", generateMessage("Chat System" , "Welcome!!"))
        socket.broadcast.to(user.room).emit("displayMsg", generateMessage("Chat System" , `${user.username} has joined the chat`))
        io.to(user.room).emit("roomData", ({
            room : user.room,
            userList : getUsersInRoom(user.room)
        }))
        ackCallback()
    })

    socket.on("msgReceived", (msg, ackCallback) => {
        const {error, user} = getUserById(socket.id)
        if(error){
            ackCallback(error)
            return
        }

        io.to(user.room).emit("displayMsg", generateMessage(user.username, msg))
        ackCallback()
    })

    socket.on("disconnect", () => {
        const socketId = socket.id
        const {error, user} = getUserById(socketId)
        if(error){
            console.log(error)
            return
        }
        removeUser(user.id)
        io.to(user.room).emit("displayMsg", generateMessage("Chat System" , `${user.username} has left the chat`))
        io.to(user.room).emit("roomData", ({
            room : user.room,
            userList : getUsersInRoom(user.room)
        }))
    })

    socket.on("location", (coordinates, ackCallback) => {
        const {error, user} = getUserById(socket.id)
        if(error){
            ackCallback(error)
            return
        }
        io.to(user.room).emit("locationMsg", generateMessage(user.username, `https://google.com/maps/?q=${coordinates.lat},${coordinates.long}`))
        ackCallback()
    })
    
})

server.listen(port, () => {
    console.log("Server is up and running on port", port)
})