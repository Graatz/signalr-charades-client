import { EventEmitter, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { Message, IPoint } from '../models/chat.models';
import { ILobby } from '../models/lobbies.models';
import { HubService } from './hub.service';

@Injectable()
export class DrawingService {
    segmentPointReceived = new EventEmitter<IPoint>();

    constructor(protected readonly hubService: HubService) {
        this.registerOnServerEvents();
    }

    public sendSegmentPoint(point: IPoint, lobbyId: string) {
        this.hubService.invoke('NewSegmentPoint', point, lobbyId);
    }

    private registerOnServerEvents(): void {
        this.hubService.on('SegmentPointReceived', (data: IPoint) => {
            this.segmentPointReceived.emit(data);
        });
    }
}    