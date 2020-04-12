import React, { Component } from 'react'; 
import io from 'socket.io-client';
import { USER_CONNECTED, LOGOUT } from '../Events';
import LoginForm from './LoginForm';
import ChatContainer from '../chat/ChatContainer';

//const socketUrl = "http://10.0.0.54:3006";
const socketUrl = "http://localhost:5000";
export default class Layout extends Component {

    constructor(props) {
        super(props);

        this.state = {
            socket: null,
            user: null
        };
    }

    componentDidMount() {
        this.initSocket()
    }
//Connect to & initialise Socket.
    initSocket = () => {
        const socket = io(socketUrl)
        socket.on('connect', () => {
            console.log("Connected!");
        })
        this.setState = ({ socket })
    }
//sets user property.
    setUser = (user) => {
        const { socket } = this.state
        socket.emit(USER_CONNECTED, user);
        this.setState({ user })
    }
// Sets user property in state to Null.
    logout = () => {
        const { socket } = this.state
        socket.emit(LOGOUT);
        this.setState({ user: null })
    }

    render() {
        //const { title } = this.props
        const { socket, user } = this.state
        return(
            <div className="container">
                {
                    !user ? 
                    <LoginForm socket={socket} setUser={this.setUser} /> 
                    :
                    <ChatContainer socket={socket} user={user} logout={this.logout} />
                }
            </div>
        );
    }
}

