export interface Notification {

  id: number;

  actionType: string;

  message: string;

  referenceId: number | null;

  read: boolean;

  createdAt: Date;

}