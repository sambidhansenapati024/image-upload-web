import { Injectable } from '@angular/core';
import { NotificationWebsocketService } from './notification-websocket.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  private notificationsSubject = new BehaviorSubject<any[]>([]);

  notifications$ = this.notificationsSubject.asObservable();

  constructor(
    private websocketService: NotificationWebsocketService
  ) {

    this.websocketService.notifications$
      .subscribe(notification => {

        const notifications = this.notificationsSubject.value;

        this.notificationsSubject.next([
          notification,
          ...notifications
        ]);

      });

  }
}
