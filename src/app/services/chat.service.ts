import { EventEmitter, Injectable } from '@angular/core';
import { Message, IPoint } from '../models/chat.models';
import { HubService } from './hub.service';

@Injectable()
export class ChatService {
  messageReceived = new EventEmitter<Message>();

  constructor(protected readonly hubService: HubService) {
    this.registerOnServerEvents();
  }

  public sendMessage(message: Message, lobbyId: string): void {
    this.hubService.invoke('NewMessage', message, lobbyId);
  }

  private registerOnServerEvents(): void {
    this.hubService.on('MessageReceived', (data: Message) => {
      this.messageReceived.emit(data);
    });
  }
}    