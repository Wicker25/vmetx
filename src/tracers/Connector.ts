import * as SocketIOClient from 'socket.io-client';
import io from 'socket.io-client/dist/socket.io';

export type Timer = number;

export interface MetricsData {
  initiatorType: string;
  protocol: string;
  hostname: string;
}

export class Connector {
  static readonly METRICS_CHANNEL = 'metrics';

  private socket: SocketIOClient.Socket;

  constructor(serverUrl: string) {
    this.socket = io(serverUrl);
  }

  sendMetrics(name: string, data: any) {
    this.socket.emit(Connector.METRICS_CHANNEL, { name, data });
  }
}
