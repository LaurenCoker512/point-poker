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
    // const userId = client.data.userId;
    // const boardId = client.data.boardId;
    // if (userId && boardId) {
    //   await this.prisma.user.delete({
    //     where: { id: userId },
    //   });

    //   const updatedBoard = await this.boardService.findOne(boardId);
    //   client.to(boardId).emit('userListUpdated', updatedBoard.users);
    // }
  }

  @SubscribeMessage('joinBoard')
  async handleJoinBoard(
    @MessageBody() payload: { boardId: string; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { boardId, userName } = payload;

    // Check if user already exists for this board
    let user = await this.prisma.user.findFirst({
      where: { boardId, name: userName },
    });

    if (!user) {
      // Determine if this user should be moderator
      const currentUsers = await this.prisma.user.findMany({
        where: { boardId },
      });
      const isModerator = currentUsers.length === 0;
      user = await this.prisma.user.create({
        data: { name: userName, boardId, isModerator },
      });
    }

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

    await this.prisma.user.update({
      where: { id: userId, boardId },
      data: { vote: payload.vote, hasVoted: true },
    });

    const updatedBoard = await this.boardService.findOne(boardId);
    client.to(boardId).emit('userListUpdated', updatedBoard.users);
    client.emit('userListUpdated', updatedBoard.users);
  }

  @SubscribeMessage('revealVotes')
  async handleRevealVotes(@ConnectedSocket() client: Socket) {
    console.log('Reveal votes!');
    const userId = client.data.userId;
    const boardId = client.data.boardId;

    console.log(userId);
    console.log(boardId);

    if (!userId || !boardId) {
      client.emit('error', { message: 'Not joined to a board' });
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId, boardId },
    });

    if (!user || !user.isModerator) {
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

    const user = await this.prisma.user.findUnique({
      where: { id: userId, boardId },
    });

    if (!user || !user.isModerator) {
      client.emit('error', { message: 'Not authorized' });
      return;
    }

    await this.boardService.resetVotes(boardId);

    const unsanitizedBoardData = await this.boardService.findOne(boardId);
    client.to(boardId).emit('boardReset', unsanitizedBoardData);
    client.emit('boardReset', unsanitizedBoardData);
  }
}
