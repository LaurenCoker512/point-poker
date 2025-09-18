import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardService {
  constructor(private prisma: PrismaService) {}

  async create(createBoardDto: CreateBoardDto) {
    return this.prisma.$transaction(async (prisma) => {
      const board = await prisma.board.create({
        data: {
          name: `Board ${Date.now()}`,
        },
      });

      // Create mod user, link to board
      const moderator = await prisma.user.create({
        data: {
          name: createBoardDto.userName,
          isModerator: true,
          boardId: board.id,
        },
      });

      return { id: board.id, userId: moderator.id };
    });
  }

  async findOne(id: string, userId?: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            isModerator: true,
            vote: true,
            hasVoted: true,
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    // If votes not yet revealed, clear each user's vote value
    if (!board.isRevealed && userId) {
      board.users = board.users.map((user) => ({
        ...user,
        vote: user.id === userId ? user.vote : null,
      }));
    } else if (!board.isRevealed) {
      board.users = board.users.map((user) => ({
        ...user,
        vote: null,
      }));
    }

    return board;
  }

  async isModerator(userId: string, boardId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, boardId },
    });
    return !!user?.isModerator;
  }

  async joinUser(boardId: string, userName: string) {
    let user = await this.prisma.user.findFirst({
      where: { boardId, name: userName },
    });

    if (!user) {
      const currentUsers = await this.prisma.user.findMany({
        where: { boardId },
      });
      const isModerator = currentUsers.length === 0;
      user = await this.prisma.user.create({
        data: { name: userName, boardId, isModerator },
      });
    }
    return user;
  }

  async submitVote(boardId: string, body: { userId: string; vote: string }) {
    const { userId, vote } = body;
    const user = await this.prisma.user.update({
      where: { id: userId, boardId },
      data: { vote, hasVoted: true },
    });
    return { success: true, user };
  }

  async resetVotes(id: string) {
    return this.prisma.$transaction(async (prisma) => {
      await prisma.user.updateMany({
        where: { boardId: id },
        data: { vote: null, hasVoted: false },
      });
      await prisma.board.updateMany({
        where: { id },
        data: { isRevealed: false },
      });
    });
  }

  async setRevealed(id: string) {
    return this.prisma.board.updateMany({
      where: { id },
      data: { isRevealed: true },
    });
  }
}
