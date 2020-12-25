import { Component, OnInit, NgZone, Input } from '@angular/core';
import { Message } from '../../models/chat.models';
import { ChatService } from '../../services/chat.service';
import { FormControl } from '@angular/forms';
import { BaseComponent } from 'src/app/helpers/base.component';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ILobby } from 'src/app/models/lobbies.models';
import { PlayerService } from 'src/app/services/player.service';
import { LobbiesService } from 'src/app/services/lobbies.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent extends BaseComponent implements OnInit {
  public playerId: string;
  public chatInput: FormControl = new FormControl(null);
  public messages: Message[] = [];

  @Input()
  public lobby: ILobby;

  constructor(
    protected readonly ngZone: NgZone,
    protected readonly playerService: PlayerService,
    protected readonly chatService: ChatService,
    protected readonly lobbiesService: LobbiesService
  ) {
    super();
  }

  ngOnInit(): void {
    this.playerId = this.playerService.getCurrentPlayer().id;

    this.lobbiesService.currentlyJoinedLobby$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((lobby: ILobby) => {
      this.lobby = lobby;
    })

    this.chatService.messageReceived.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((message: Message) => {
      this.ngZone.run(() => {
        if (message.playerId !== this.playerId) {
          message.type = 'received';
          this.messages.push(message);
        }
      });
    });
  }

  public sendMessage(): void {
    const messageContent = this.chatInput.value;
    this.chatInput.setValue(null);

    if (messageContent) {
      const message = {
        playerId: this.playerId,
        type: 'sent',
        content: messageContent,
        timeStamp: new Date(),
      } as Message;

      this.messages.push(message);
      this.chatService.sendMessage(message, this.lobby.id);
    }
  }
}
