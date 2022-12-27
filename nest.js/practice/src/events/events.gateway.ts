import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  // on connect, emit  'user info to client'
  handleConnection(client: any, ...args: any[]) {
    // console.log('client: ', client);
    // console.log('args: ', args);
    this.server.emit('user info to client', client.id);
  }

  @SubscribeMessage('user')
  helloToUsers(@MessageBody() data: any) {
    console.log('data: ', data);
    this.server.emit('user', data);
  }

  @SubscribeMessage('chat message')
  findAll(@MessageBody() data: any) /*: Observable<WsResponse<number>> */ {
    console.log('data: ', data);
    return this.server.emit('chat message', data);
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    console.log('data: ', data);
    return data;
  }
}
