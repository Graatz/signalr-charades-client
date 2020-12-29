import { trigger, transition, style, animate } from '@angular/animations';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BaseComponent } from 'src/app/helpers/base.component';
import { LobbiesService } from '../../services/lobbies.service';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-new-lobby',
  templateUrl: './new-lobby.component.html',
  styleUrls: ['./new-lobby.component.scss']
})
export class NewLobbyComponent extends BaseComponent implements OnInit {
  public form: FormGroup;

  constructor(
    protected readonly ngZone: NgZone,
    protected readonly lobbiesService: LobbiesService,
    protected readonly playerService: PlayerService,
    protected readonly router: Router) {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      lobbyName: new FormControl(null, Validators.required)
    });

    this.lobbiesService.lobbyCreatedByCurrentPlayer.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.router.navigateByUrl('lobby');
    });
  }

  public onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const lobbyName = this.form.controls.lobbyName.value;

    this.lobbiesService.createLobby(lobbyName);
  }
}
