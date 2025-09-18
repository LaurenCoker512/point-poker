import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { BoardService } from '../board/board.service';
import { PrismaService } from '../prisma/prisma.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000' },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private boardService: BoardService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    const origin =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    server.engine.opts.cors = { origin };
    console.log('WebSocket Gateway initialized with CORS origin:', origin);
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinBoard')
  async handleJoinBoard(
    @MessageBody() payload: { boardId: string; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { boardId, userName } = payload;

    const user = await this.boardService.joinUser(boardId, userName);

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board) {
      client.emit('error', { message: 'Board not found' });
      return;
    }

    client.data.userId = user.id;
    client.data.boardId = board.id;
    client.join(board.id);

    const updatedBoard = await this.boardService.findOne(board.id);
    client.to(board.id).emit('userListUpdated', updatedBoard.users);
    client.emit('userListUpdated', updatedBoard.users);
    client.emit('userJoined', { userId: user.id });
  }

  @SubscribeMessage('submitVote')
  async handleSubmitVote(
    @MessageBody() payload: { vote: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    const boardId = client.data.boardId;
    if (!userId || !boardId) {
      client.emit('error', { message: 'Not joined to a board' });
      return;
    }

    await this.boardService.submitVote(boardId, { userId, vote: payload.vote });

    const updatedBoard = await this.boardService.findOne(boardId);
    client.to(boardId).emit('userListUpdated', updatedBoard.users);
    client.emit('userListUpdated', updatedBoard.users);
  }

  @SubscribeMessage('revealVotes')
  async handleRevealVotes(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    const boardId = client.data.boardId;

    if (!userId || !boardId) {
      client.emit('error', { message: 'Not joined to a board' });
      return;
    }

    const isMod = await this.boardService.isModerator(userId, boardId);
    if (!isMod) {
      client.emit('error', { message: 'Not authorized' });
      return;
    }

    await this.boardService.setRevealed(boardId);

    const unsanitizedBoardData = await this.boardService.findOne(boardId);
    client.to(boardId).emit('votesRevealed', unsanitizedBoardData);
    client.emit('votesRevealed', unsanitizedBoardData);
  }

  @SubscribeMessage('resetBoard')
  async resetBoard(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    const boardId = client.data.boardId;

    if (!userId || !boardId) {
      client.emit('error', { message: 'Not joined to a board' });
      return;
    }

    const isMod = await this.boardService.isModerator(userId, boardId);
    if (!isMod) {
      client.emit('error', { message: 'Not authorized' });
      return;
    }

    await this.boardService.resetVotes(boardId);

    const unsanitizedBoardData = await this.boardService.findOne(boardId);
    client.to(boardId).emit('boardReset', unsanitizedBoardData);
    client.emit('boardReset', unsanitizedBoardData);
  }
}
