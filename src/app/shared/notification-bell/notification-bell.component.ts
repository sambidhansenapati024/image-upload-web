import { Component } from '@angular/core';
import { NotificationService } from '../../service/notification.service';
import { CommonModule } from '@angular/common';
import {  Badge } from 'primeng/badge';
import { Popover } from "primeng/popover";
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Notification } from '../modal/notification';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-notification-bell',
  imports: [CommonModule, Badge, Popover,
    RouterModule,ButtonModule,
    TooltipModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.css'
})
export class NotificationBellComponent {
  activeTab: 'ALL' | 'UNREAD' | 'READ' = 'ALL';

   constructor(
     public notificationService: NotificationService,
  private router: Router,
   private confirmationService: ConfirmationService
  ) {}

  get filteredNotifications(): Notification[] {

    const notifications = this.notificationService.getNotifications();

    switch (this.activeTab) {

        case 'UNREAD':
            return notifications.filter(notification => !notification.read);

        case 'READ':
            return notifications.filter(notification => notification.read);

        default:
            return notifications;

    }

}

  getNotificationTitle(actionType: string): string {

  switch (actionType) {

    case 'LOGIN':
      return 'Login';

    case 'LOGOUT':
      return 'Logout';

    case 'IMAGE_UPLOAD':
      return 'Image Uploaded';

    case 'IMAGE_DELETE':
      return 'Image Deleted';

    case 'IMAGE_EDIT':
      return 'Image Edited';

    case 'IMAGE_RENAME':
      return 'Image Renamed';

    case 'IMAGE_DOWNLOAD':
      return 'Image Downloaded';

    case 'IMAGE_RESTORE':
      return 'Image Restored';

    case 'PASSWORD_CHANGE':
      return 'Password Changed';

    case 'PROFILE_UPDATE':
      return 'Profile Updated';

    case 'FOLDER_CREATE':
      return 'Folder Created';

    case 'FOLDER_RENAME':
      return 'Folder Renamed';

    case 'FOLDER_DELETE':
      return 'Folder Deleted';

    default:
      return 'Notification';

  }

}

getNotificationSeverity(actionType: string): string {

    switch (actionType) {

        case 'UPLOAD':
        case 'SUCCESS':
            return 'success';

        case 'INFO':
        case 'SYSTEM':
            return 'info';

        case 'WARNING':
            return 'warning';

        case 'ERROR':
        case 'FAILED':
            return 'error';

        default:
            return 'info';
    }

}

getNotificationIcon(actionType: string): string {

  switch (actionType) {

    case 'LOGIN':
      return 'pi pi-sign-in';

    case 'LOGOUT':
      return 'pi pi-sign-out';

    case 'IMAGE_UPLOAD':
      return 'pi pi-upload';

    case 'IMAGE_DELETE':
      return 'pi pi-trash';

    case 'IMAGE_RESTORE':
      return 'pi pi-history';

    case 'IMAGE_EDIT':
      return 'pi pi-pencil';

    case 'IMAGE_RENAME':
      return 'pi pi-file-edit';

    case 'IMAGE_DOWNLOAD':
      return 'pi pi-download';

    case 'PROFILE_UPDATE':
      return 'pi pi-user-edit';

    case 'PASSWORD_CHANGE':
      return 'pi pi-lock';

    case 'FOLDER_CREATE':
      return 'pi pi-folder-plus';

    case 'FOLDER_RENAME':
      return 'pi pi-folder';

    case 'FOLDER_DELETE':
      return 'pi pi-folder-minus';

    default:
      return 'pi pi-bell';

  }

}
markAllAsRead(): void {

  this.notificationService.markAllAsRead();

}

clearAll(): void {

  this.confirmationService.confirm({

        header: 'Clear Notifications',

        message: 'Are you sure you want to remove all notifications?',

        icon: 'pi pi-exclamation-triangle',

        acceptLabel: 'Clear',

        rejectLabel: 'Cancel',

        acceptButtonStyleClass: 'p-button-danger',

        rejectButtonStyleClass: 'p-button-text',

        accept: () => {

            this.notificationService.clearAll();

        }

    });

}

removeNotification(id: number, event: Event): void {

  event.stopPropagation();

  this.notificationService.removeNotification(id);

}

openNotification(notification: Notification): void {

  this.notificationService.openNotification(notification.id);

}

getRelativeTime(date: Date): string {

  const now = new Date().getTime();
  const created = new Date(date).getTime();

  const diffInSeconds = Math.floor((now - created) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays === 1) {
    return 'Yesterday';
  }

  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
}).format(new Date(date));

}

}
