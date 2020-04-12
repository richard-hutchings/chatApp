import React, { Component } from "react";
import SideBar from '../components/SideBar'
import { COMMUNITY_CHAT, MESSAGE_SENT, MESSAGE_RECIEVED, TYPING } from '../Events';
import ChatHeading from './ChatHeading';
import Messages from './Messages';
import MessageInput from './MessageInput';

export default class ChatContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            chats: [],
            activeChat: null
        };
    }

    componentDidMount() {
        const { socket } = this.props
        socket.emit(COMMUNITY_CHAT, this.resetChat)
    }

    // Resets chat.
    resetChat = (chat) => {
        return  this.addChat(chat, true)
    }

    //Adds chat to chat container
    addChat = (chat, reset) => {
        const { socket } = this.props
        const { chats } = this.state
        const newChats = reset ? [chat] : [...chats, chat]
        this.setState({chats: newChats, activeChat: reset ? chat : this.state.activeChat})

        const messageEvent = `${MESSAGE_RECIEVED}-${chat.id}`
        const typingEvent = `${TYPING}-${chat.id}`

        socket.on(typingEvent, this.updateTypingInChat(chat.id))
        socket.on(messageEvent, this.addMessageToChat(chat.id))
    }

    //Adds message to chat with chat Id being passed in.
    addMessageToChat = (chatId) => {
            return message => {
                const { chats } = this.state
                let newChats = chats.map((chat) => {
                    if(chat.id === chatId)
                        chat.messages.push(message)
                        return chat
                })
                this.setState({ chats: newChats})
            }
    }

    //updates typing of chat with chatId being passed in.
    updateTypingInChat = (chatId) => {
        return ({ isTyping, user }) => {
            if (user !== this.props.user.name) {
                const { chats } = this.state

                let newChats = chats.map((chat) => {
                    if(chat.id === chatId) {
                        if(isTyping && !chat.typingUser.includes(user)) {
                            chat.typingUser.push(user)
                        } else if (!isTyping && chat.typingUser.includes(user)) {
                            chat.typingUser = chat.typingUser.filter(u => u !== user)
                        }
                    }
                    return chat
                })
                this.setState({chats: newChats})
            }
        }
    }

    //Adds a message to the specified chat.
    sendMessage = (chatId, message) => {
        const { socket } = this.props
        socket.emit(MESSAGE_SENT, {chatId, message} )
    }

    sendTyping = (chatId, isTyping) => {
        const { socket } = this.props
        socket.emit(TYPING, {chatId, isTyping})
    }

    setActiveChat = (activeChat) => {
        this.setState({activeChat})
    }

    render() {
        const { user, logout } = this.props
        const { chats, activeChat } = this.state
        return(
            <div className="container">
                <SideBar 
                    logout={logout}
                    chats={chats}
                    user={user}
                    activeChat={activeChat}
                    setActiveChat={this.setActiveChat}
                />
                <div className="chat-room-container">
                    {
                        activeChat !== null ? (
                            <div className="chat-room">
                                <ChatHeading name={activeChat.name} />
                                <Messages 
                                    messages={activeChat.messages}
                                    user={user}
                                    typingUser={activeChat.typingUser} />
                                <MessageInput
                                    sendMessage={
                                        (message) => {
                                            this.sendMessage(activeChat.id, message)
                                        }
                                    }
                                    sendTyping={
                                        (isTyping) => {
                                            this.sendTyping(activeChat.id, isTyping)
                                        }
                                    }
                                    />
                            </div>
                        ) : <div className="chat-room-choose">
                            <h3>Choose a Chat</h3>
                        </div>
                    }
                </div>
            
            </div>
        );
    }
}

