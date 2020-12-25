import { EventEmitter, Injectable } from '@angular/core';
import { Player } from '../models/player.models';
import { HubService } from './hub.service';

@Injectable()
export class PlayerService {
    private player: Player;
    playerCreated = new EventEmitter<Player>();

    constructor(protected readonly hubService: HubService) {
        this.registerOnServerEvents();
    }

    public createPlayer(playerName: string): void {
        this.hubService.invoke('CreatePlayer', playerName);
    }

    private registerOnServerEvents(): void {
        this.hubService.on('PlayerCreated', (player: Player) => {
            this.player = player;
            this.playerCreated.emit(player);
        });
    }

    public getCurrentPlayer(): Player {
        return this.player;
    }
}    