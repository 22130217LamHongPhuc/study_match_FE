import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { SOCKET_URL } from '../config/BaseConfig';
import store from '../redux/store';

class WebSocketManager {
    private static instance: WebSocketManager;
    private client: Client | null = null;
    private connected = false;
    private connectingPromise: Promise<void> | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();

    private constructor() { }

    public static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }


    public connect(): Promise<void> {
        if (this.connected && this.client?.connected) {
            return Promise.resolve();
        }

        if (this.connectingPromise) {
            return this.connectingPromise;
        }

        this.connectingPromise = new Promise((resolve, reject) => {
            this.client = new Client({
                brokerURL: SOCKET_URL,
                connectHeaders: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken') as string}`
                },
                reconnectDelay: 5000,
                debug: (str: any) => console.log('[STOMP]', str),

                onConnect: () => {
                    this.connected = true;
                    this.connectingPromise = null;
                    console.log('STOMP connected');
                    resolve();
                },

                onDisconnect: () => {
                    this.connected = false;
                    this.connectingPromise = null;
                    console.log('STOMP disconnected');
                },

                onStompError: (frame: any) => {
                    console.error('STOMP error:', frame);
                },

                onWebSocketError: (error: any) => {
                    console.error('WebSocket error:', error);
                    this.connected = false;
                    this.connectingPromise = null;
                    reject(error);
                },
            });

            this.client.activate();
        });

        return this.connectingPromise;
    }

    public onMessage(destination: string, cb: (msg: string) => void) {
        if (!this.client || !this.connected) return;
        if (this.subscriptions.has(destination)) return;

        const subscription = this.client.subscribe(destination, (message: IMessage) => {
            cb(message.body);
        });
        this.subscriptions.set(destination, subscription);
    }

    public sendMessage(destination: string, body: any = '') {
        if (!this.client || !this.connected || !this.client.connected) {
            throw new Error('WebSocket chưa kết nối');
        }

        this.client.publish({
            destination,
            body: typeof body === 'string' ? body : JSON.stringify(body),
        });
    }

    public disconnect() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions.clear();

        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }

        this.connected = false;
        this.connectingPromise = null;
    }
}

export default WebSocketManager;
