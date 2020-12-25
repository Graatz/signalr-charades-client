import { Player } from "./player.models";

export interface ILobby {
    id: string;
    name: string;
    inGame: boolean;
    players: Player[];
    createdByPlayerId: string;
}

export interface ILobbyPlayer {
    lobbyId: string;
    player: Player;
}