const users = []

const adduser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required',
        }
    }
    //check for existing user
    const existinguser = users.find((user) => {
        return user.room === room && user.username === username
    })
    //validate username
    if (existinguser) {
        return {
            error: 'Username already taken for this room!'
        }
    }

    //store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeuser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}

const getuser = (id) => {
    return users.find((user) => user.id === id)
}

const getusersinroom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    adduser,
    removeuser,
    getuser,
    getusersinroom
}
