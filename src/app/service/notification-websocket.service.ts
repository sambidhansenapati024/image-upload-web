import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenService } from '../core/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationWebsocketService {

   private client!: Client;

  private notificationSubject = new Subject<any>();

  notifications$ = this.notificationSubject.asObservable();

  constructor(private tokenService: TokenService) { }

  connect(): void {

    const token = this.tokenService.getToken();

    if (!token) {
      return;
    }

    this.client = new Client({

      webSocketFactory: () =>
        new SockJS(`${environment.apiUrl}/ws`),

      connectHeaders: {
        Authorization: `Bearer ${token}`
      },

      reconnectDelay: 5000,

      //debug: (message) => console.log(message)

    });

    this.client.onConnect = () => {

      ////console.log('WebSocket Connected');

      this.client.subscribe(
        '/user/queue/notifications',
        (message: IMessage) => {
          ////console.log('📩 WebSocket message received:', message.body);

          this.notificationSubject.next(
            JSON.parse(message.body)
          );

        }
      );

    };

    this.client.activate();
  }

  disconnect(): void {

    if (this.client?.active) {
      this.client.deactivate();
    }

  }
}
