import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BaseComponent } from 'src/app/helpers/base.component';
import { ILobby } from 'src/app/models/lobbies.models';
import { Player } from 'src/app/models/player.models';
import { LobbiesService } from 'src/app/services/lobbies.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent extends BaseComponent implements OnInit {
  public notifications: string[] = [];
  public lobby: ILobby;

  constructor(
    protected readonly router: Router,
    protected readonly lobbiesService: LobbiesService
  ) {
    super();
  }

  ngOnInit(): void {
    this.lobbiesService.playerJoinedLobby.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((player: Player) => {
      this.notifications.push(`Player ${player.name} joined the lobby`);
    });

    this.lobbiesService.playerLeftLobby.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((player: Player) => {
      this.notifications.push(`Player ${player.name} left the lobby`);
    });

    this.lobbiesService.currentlyJoinedLobby$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((lobby: ILobby) => {
      this.lobby = lobby;
    })

    this.lobbiesService.currentPlayerLeftLobby.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.router.navigateByUrl('lobbies');
    });

    this.lobbiesService.currentlyJoinedLobbyGameStarted.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.router.navigateByUrl('game');
    });
  }

  public onLeaveLobbyClick(): void {
    this.lobbiesService.leaveLobby(this.lobby.id);
  }

  public onStartGameClick(): void {
    this.lobbiesService.startGame(this.lobby.id);
  }
}
