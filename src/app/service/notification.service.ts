import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification } from '../shared/modal/notification';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { NotificationWebsocketService } from './notification-websocket.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  private readonly API = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient,
    private notificationWebSocketService: NotificationWebsocketService
  ) { 

     this.notificationWebSocketService.notifications$
    .subscribe(notification => {
       console.log('🔔 NotificationService received:', notification);
      this.notificationsSubject.next([
        notification,
        ...this.notificationsSubject.value
      ]);

    });
  }

  loadNotifications(): void {

  this.http.get<Notification[]>(this.API)
    .subscribe({

      next: (notifications) => {

        this.notificationsSubject.next(notifications);

      },

      error: (error) => {

        console.error('Failed to load notifications', error);

      }

    });

}

markAllAsRead(): void {

  this.http.put(`${this.API}/read-all`, {}).subscribe({

    next: () => {

      const updated = this.notificationsSubject.value.map(notification => ({

        ...notification,
        read: true

      }));

      this.notificationsSubject.next(updated);

    },

    error: (error) => {

      console.error('Failed to mark notifications as read', error);

    }

  });

}

markAsRead(id: number): void {

  this.http.put(`${this.API}/${id}/read`, {}).subscribe({

    next: () => {

      const updated = this.notificationsSubject.value.map(notification =>

        notification.id === id
          ? { ...notification, read: true }
          : notification

      );

      this.notificationsSubject.next(updated);

    },

    error: (error) => {

      console.error('Failed to mark notification as read', error);

    }

  });

}

openNotification(id: number): void {

  this.markAsRead(id);

}

removeNotification(id: number): void {

  this.http.delete(`${this.API}/${id}`).subscribe({

    next: () => {

      const updated = this.notificationsSubject.value.filter(

        notification => notification.id !== id

      );

      this.notificationsSubject.next(updated);

    },

    error: (error) => {

      console.error('Failed to delete notification', error);

    }

  });

}

clearAll(): void {

  this.http.delete(this.API).subscribe({

    next: () => {

      this.notificationsSubject.next([]);

    },

    error: (error) => {

      console.error('Failed to clear notifications', error);

    }

  });

}








  getNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }

//   markAsRead(id: number): void {

//   const updated = this.notificationsSubject.value.map(notification =>

//     notification.id === id
//       ? { ...notification, read: true }
//       : notification

//   );

//   this.notificationsSubject.next(updated);

// }

// markAllAsRead(): void {

//   const updated = this.notificationsSubject.value.map(notification => ({

//     ...notification,
//     read: true

//   }));

//   this.notificationsSubject.next(updated);

// }

// removeNotification(id: number): void {

//   const updated = this.notificationsSubject.value.filter(

//     notification => notification.id !== id

//   );

//   this.notificationsSubject.next(updated);

// }

// clearAll(): void {

//   this.notificationsSubject.next([]);

// }

// openNotification(id: number): void {

//   const updated = this.notificationsSubject.value.map(notification =>

//     notification.id === id
//       ? { ...notification, read: true }
//       : notification

//   );

//   this.notificationsSubject.next(updated);

// }

}
