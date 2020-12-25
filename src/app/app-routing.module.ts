import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameComponent } from './components/game/game.component';
import { LobbiesComponent } from './components/lobbies/lobbies.component';
import { NewPlayerComponent } from './components/new-player/new-player.component';
import { NewLobbyComponent } from './components/new-lobby/new-lobby.component';
import { PlayerGuard } from './helpers/guards/player.guard';
import { LobbyComponent } from './components/lobby/lobby.component';

const routes: Routes = [
  {
    path: '', canActivate: [PlayerGuard], children: [
      { path: '', component: NewPlayerComponent },
      { path: 'new-lobby', component: NewLobbyComponent },
      { path: 'lobbies', component: LobbiesComponent },
      { path: 'lobby', component: LobbyComponent },
      { path: 'game', component: GameComponent }
    ]
  },
  { path: 'new-player', component: NewPlayerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
