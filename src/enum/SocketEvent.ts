import { Socket } from "dgram";


export enum SocketEvent {
    FIRST_PRIVATE_MESS = 'FIRST_PRIVATE_MESS',
    SEND_CHAT = 'SEND_CHAT',
    RECEIVE_CHAT = 'RECEIVE_CHAT',
    USER_JOINED = 'USER_JOINED',
    USER_LEFT = 'USER_LEFT',
    MESSAGE_ACK = 'MESSAGE_ACK',
    NEW_MESSAGE = 'NEW_MESSAGE'
}