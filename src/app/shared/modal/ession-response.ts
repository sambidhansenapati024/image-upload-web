export interface SessionResponse {

  sessionId: string;

  browser: string;

  operatingSystem: string;

  device: string;

  location: string | null;

  loginTime: string;

  lastActivity: string;

  currentSession: boolean;

}