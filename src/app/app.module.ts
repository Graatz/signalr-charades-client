import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './components/game/game.component';
import { HttpClientModule } from '@angular/common/http';
import { RiotService } from './services/riot.service'
import { ChatService } from './services/chat.service'
import { PlayerService } from './services/player.service'
import { HubService } from './services/hub.service'
import { DrawingService } from './services/drawing.service'
import { LobbiesService } from './services/lobbies.service'
import { ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from './components/chat/chat.component';
import { NewPlayerComponent } from './components/new-player/new-player.component';
import { LobbiesComponent } from './components/lobbies/lobbies.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { NewLobbyComponent } from './components/new-lobby/new-lobby.component';
import { PlayerGuard } from './helpers/guards/player.guard';
import { BaseComponent } from './helpers/base.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    ChatComponent,
    NewPlayerComponent,
    LobbiesComponent,
    LobbyComponent,
    NewLobbyComponent,
    BaseComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    HubService,
    RiotService,
    DrawingService,
    ChatService,
    PlayerService,
    LobbiesService,
    PlayerGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
