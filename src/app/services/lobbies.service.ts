import { EventEmitter, Injectable, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ILobby, ILobbyPlayer } from '../models/lobbies.models';
import { Player } from '../models/player.models';
import { HubService } from './hub.service';
import { PlayerService } from './player.service';

@Injectable()
export class LobbiesService {
    lobbiesRetrieved = new EventEmitter<ILobby[]>();

    lobbyCreated = new EventEmitter<ILobby>();
    lobbyCreatedByCurrentPlayer = new EventEmitter();
    lobbyRemoved = new EventEmitter<ILobby>();

    playerJoinedLobby = new EventEmitter<Player>();
    currentPlayerJoinedLobby = new EventEmitter();

    playerLeftLobby = new EventEmitter<Player>();
    currentPlayerLeftLobby = new EventEmitter();

    currentlyJoinedLobbyGameStarted = new EventEmitter();

    public lobbies$: BehaviorSubject<ILobby[]> = new BehaviorSubject([]);
    public currentlyJoinedLobby$: BehaviorSubject<ILobby> = new BehaviorSubject(null);

    constructor(protected readonly hubService: HubService, protected readonly playerService: PlayerService) {
        this.registerOnServerEvents();
    }

    public getLobbies(): void {
        this.hubService.invoke('GetLobbies');
    }

    public createLobby(lobbyName: string): void {
        this.hubService.invoke('NewLobby', lobbyName);
    }

    public joinLobby(lobbyId: string): void {
        this.hubService.invoke('JoinLobby', lobbyId);
    }

    public leaveLobby(lobbyId: string): void {
        this.hubService.invoke('LeaveLobby', lobbyId);
    }

    public startGame(lobbyId: string): void {
        this.hubService.invoke('StartGame', lobbyId);
    }

    public selectLobbies(): Observable<ILobby[]> {
        return this.lobbies$.asObservable();
    }

    private registerOnServerEvents(): void {
        this.hubService.on('GetLobbies', (lobbies: ILobby[]) => {
            this.lobbies$.next(lobbies);
            this.lobbiesRetrieved.emit(lobbies);
        });

        this.hubService.on('GameStarted', (lobby: ILobby) => {
            const startedLobby = this.lobbies$.value.find(l => l.id === lobby.id);

            if (startedLobby) {
                startedLobby.inGame = true;
            }

            if (this.currentlyJoinedLobby$.value.id === lobby.id) {
                this.currentlyJoinedLobbyGameStarted.emit();
            }
        });

        this.hubService.on('LobbyCreated', (lobby: ILobby) => {
            this.lobbies$.next([...this.lobbies$.value, lobby]);
            this.lobbyCreated.emit(lobby);
        });

        this.hubService.on('LobbyCreatedByCurrentPlayer', (lobby: ILobby) => {
            this.currentlyJoinedLobby$.next(lobby);
            this.lobbyCreatedByCurrentPlayer.emit();
        });

        this.hubService.on('LobbyRemoved', (lobby: ILobby) => {
            const lobbiesCopy = this.lobbies$.value;
            lobbiesCopy.splice(lobbiesCopy.findIndex(l => l.id === lobby.id), 1);

            this.lobbies$.next(lobbiesCopy);
            this.lobbyRemoved.emit(lobby);
        });

        this.hubService.on('PlayerJoinedLobby', (player: Player) => {
            const lobbyCopy = this.currentlyJoinedLobby$.value;
            lobbyCopy.players.push(player);
            this.currentlyJoinedLobby$.next(lobbyCopy);

            this.playerJoinedLobby.emit(player);
        });

        this.hubService.on('CurrentPlayerJoinedLobby', (lobby: ILobby) => {
            this.currentlyJoinedLobby$.next(lobby);
            this.currentPlayerJoinedLobby.emit();
        });

        this.hubService.on('PlayerLeftLobby', (player: Player) => {
            const lobbyCopy = this.currentlyJoinedLobby$.value;
            const playerIndex = lobbyCopy.players.findIndex(p => p.id === player.id)
            lobbyCopy.players.splice(playerIndex, 1);

            this.currentlyJoinedLobby$.next(lobbyCopy);
            this.playerLeftLobby.emit(player);
        });

        this.hubService.on('CurrentPlayerLeftLobby', () => {
            this.currentlyJoinedLobby$.next(null);
            console.warn('LOL')
            this.currentPlayerLeftLobby.emit();
        });
    }
}    