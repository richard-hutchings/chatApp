const io = require('./index.js').io

const { VERIFY_USER, USER_CONNECTED, USER_DISCONNECTED, COMMUNITY_CHAT, LOGOUT,
 MESSAGE_RECIEVED, MESSAGE_SENT, TYPING } = require('../Events')

const { createUser, createMessage, createChat } = require('../Factories')

let connectedUsers = { }
let communityChat = createChat()

module.exports = function(socket) {
   // console.log('\xlbc'); //supposed to clear console.
    console.log('Socket ID: ' + socket.id);
    let sendMessageToChatFromUser;
    let sendTypingFromUser;

// Verify UserName
socket.on(VERIFY_USER, (nickname, callback) => {
    if(isUser(connectedUsers, nickname)) {
        callback({ isUser: true, user: null })
    } else {
        callback ({ isUser: false, user: createUser({name: nickname})})
    }
})

// User connects with UserName.
socket.on(USER_CONNECTED, (user) => {
    connectedUsers = addUser(connectedUsers, user)
    socket.user = user

    sendMessageToChatFromUser = sendMessageToChat(user.name)
    sendTypingFromUser = sendTypingToChat(user.name)

    io.emit(USER_CONNECTED, connectedUsers)
    console.log(connectedUsers);
})
// User Disconnects.
socket.on('disconnect', () => {
    if('user' in socket) {
        connectedUsers = removeUser(connectedUsers, socket.user.name)

        io.emit(USER_DISCONNECTED, connectedUsers)
        console.log("Disconnect", connectedUsers);
    }
})
// User Logouts.
socket.on(LOGOUT, () => {
    connectedUsers = removeUser(connectedUsers, socket.user.name)
    io.emit(USER_DISCONNECTED, connectedUsers)
    console.log("Disconnected", connectedUsers)
})

// Get Community Chat
socket.on(COMMUNITY_CHAT, (callback) => {
    callback(communityChat)
})

socket.on(MESSAGE_SENT, ({chatId, message}) => {
    sendMessageToChatFromUser(chatId, message)
})

socket.on(TYPING, ({chatId, isTyping}) => {
    sendTypingFromUser(chatId, isTyping)
})
}

function sendTypingToChat(user) {
    return (chatId, isTyping) => {
        io.emit(`${TYPING}-${chatId}`, {user, isTyping})
    }
}

function sendMessageToChat(sender) {
    return (chatId, message) => {
        io.emit(`${MESSAGE_RECIEVED}-${chatId}`, createMessage({message, sender}))
    }
}

//Adds User to list passed in.
function addUser(userList, user) {
    let newList = Object.assign({}, userList)
    //Adjustment to variable result. user replaced name.
    newList[user.name] = user
    return newList
}

// Removes user from the list
function removeUser(userList, username) {
    let newList = Object.assign({}, userList)
    delete newList[username]
    return newList
}

//To Check if User is in List.
function isUser(userList, username) {
    return username in userList
}