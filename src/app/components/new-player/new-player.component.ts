import { Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Player } from 'src/app/models/player.models';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-new-player',
  templateUrl: './new-player.component.html',
  styleUrls: ['./new-player.component.scss']
})
export class NewPlayerComponent implements OnInit {
  public form: FormGroup;

  constructor(
    protected readonly ngZone: NgZone,
    protected readonly playerService: PlayerService,
    protected readonly router: Router) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      playerName: new FormControl(null, Validators.required)
    });

    this.subscribeToEvents();
  }

  public onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const playerName = this.form.controls.playerName.value;

    this.playerService.createPlayer(playerName);
  }

  private subscribeToEvents(): void {
    this.playerService.playerCreated.subscribe((player: Player) => {
      this.ngZone.run(() => {
        if (player.id != null) {
          this.router.navigateByUrl('lobbies');
        }
      });
    });
  }
}
