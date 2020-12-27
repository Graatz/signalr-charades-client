import { Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from 'src/app/helpers/base.component';
import { Player } from 'src/app/models/player.models';
import { IChampionsData } from 'src/app/models/riot.models';
import { PlayerService } from 'src/app/services/player.service';
import { RiotService } from 'src/app/services/riot.service';

@Component({
  selector: 'app-new-player',
  templateUrl: './new-player.component.html',
  styleUrls: ['./new-player.component.scss']
})
export class NewPlayerComponent extends BaseComponent implements OnInit {
  public form: FormGroup;

  private champions$: Observable<IChampionsData>;
  private champions: IChampionsData;

  constructor(
    protected readonly ngZone: NgZone,
    protected readonly playerService: PlayerService,
    protected readonly riotService: RiotService,
    protected readonly router: Router) { 
      super();
    }

  ngOnInit(): void {
    this.form = new FormGroup({
      playerName: new FormControl(null, Validators.required)
    });

    this.subscribeToEvents();
    this.champions$ = this.riotService.getChampions();
    this.champions$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      this.champions = result;
    });
  }

  public onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const playerName = this.form.controls.playerName.value;

    //const avatarImage = this.champions.data[0];

    const randomChampion = Object.keys(this.champions.data)[Math.floor(Math.random() * Object.keys(this.champions.data).length)];
    const avatar = `http://ddragon.leagueoflegends.com/cdn/10.25.1/img/champion/${randomChampion}.png`;

    this.playerService.createPlayer(playerName, avatar);
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
