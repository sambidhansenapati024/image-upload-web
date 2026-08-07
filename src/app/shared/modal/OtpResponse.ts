export interface OtpResponse {

  success: boolean;

  message: string;

  errorCode?: string;

  remainingAttempts?: number;

}