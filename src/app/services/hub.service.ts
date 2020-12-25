import { EventEmitter, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';

@Injectable()
export class HubService {
    private connectionStarted: Promise<void>;
    private hubConnection: HubConnection;

    constructor() {
        this.createConnection();
        this.startConnection();
    }

    public on(methodName: string, func: (...args: any[]) => void): void {
        this.connectionStarted.then(() => {
            this.hubConnection.on(methodName, func);
        })
    }

    public invoke(methodName: string, ...args: any[]): void {
        this.connectionStarted.then(() => {
            this.hubConnection.invoke(methodName, ...args);
        })
    }

    private createConnection(): void {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl('http://localhost:59325/gamehub')
            .build();
    }

    private startConnection(): void {
        this.connectionStarted = this.hubConnection.start();
        this.connectionStarted.then(() => {
            console.log("CONNECTION ESTABLISHED");
        }, () => {
            console.log("CONNECTION REJESTED");
        })
    }
}    