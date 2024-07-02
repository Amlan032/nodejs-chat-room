let users = []

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate username and room
    if(!username || !room){
        return {
            "error" : "Please enter username and room"
        }
    }

    //check for existing user in same room
    const existingUser = users.find((user) => {
        return (user.username === username && user.room === room)
    })

    if(existingUser){
        return {
            "error" : "Username already exists"
        }
    }

    //Storing the user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

//removal of user
const removeUser = (id) => {
    const postRemovalUsers = []
    users.forEach((user) => {
        if(user.id !== id){
            postRemovalUsers.push(user)
        }
    })
    if(users.length == postRemovalUsers.length){
        return {
            "error" : "User does not exist"
        }
    }
    users = postRemovalUsers
    return {
        "message" : "User removed successfully"
    }
    
}

const getUserById = (id) => {
    const userObj = users.find((user) => {
        return user.id === id
    })

    if(userObj){
        return {
            "user" : userObj
        }
    }
    return {
        "error" : "User not found"
    }
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const userList = users.filter((user) => {
        return user.room === room
    })
    return {
        userList
    }
}

module.exports = {
    addUser,
    removeUser,
    getUserById,
    getUsersInRoom
}