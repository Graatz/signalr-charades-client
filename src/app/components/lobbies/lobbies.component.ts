import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable} from 'rxjs';
import { BaseComponent } from 'src/app/helpers/base.component';
import { ILobby } from 'src/app/models/lobbies.models';
import { HubService } from 'src/app/services/hub.service';
import { LobbiesService } from 'src/app/services/lobbies.service';
import { PlayerService } from 'src/app/services/player.service';
import { takeUntil } from 'rxjs/operators';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-lobbies',
  templateUrl: './lobbies.component.html',
  styleUrls: ['./lobbies.component.scss']
})
export class LobbiesComponent extends BaseComponent implements OnInit {
  public lobbies$: Observable<ILobby[]>;

  constructor(
    protected readonly router: Router,
    protected readonly ngZone: NgZone,
    protected readonly hubService: HubService,
    protected readonly lobbiesService: LobbiesService,
    protected readonly playerService: PlayerService
  ) {
    super();
  }

  ngOnInit(): void {

    this.lobbiesService.getLobbies();

    this.lobbies$ = this.lobbiesService.selectLobbies();

    this.lobbiesService.currentPlayerJoinedLobby.pipe(
      distinctUntilChanged(),
      takeUntil(super.destroy$)
    ).subscribe(() => {
      this.router.navigateByUrl('lobby');
    })
  }

  public onAddNewLobbyClick(): void {
    this.router.navigateByUrl('new-lobby');
  }

  public onJoinLobby(lobbyId: string): void {
    this.lobbiesService.joinLobby(lobbyId);
  }
}
