import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventsGateway } from './events.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { BoardService } from '../board/board.service';

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  const prismaServiceMock = {
    board: {
      create: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(prismaServiceMock)),
  };
  let boardServiceMock: Partial<BoardService> = {
    create: jest.fn().mockResolvedValue({ id: 1, title: 'Test Board' }),
    findOne: jest.fn().mockResolvedValue({ id: 1, title: 'Test Board' }),
  };
  let mockSocket: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsGateway,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: BoardService, useValue: boardServiceMock },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should create a new user and assign moderator if first user', async () => {
    prismaServiceMock.user.findFirst.mockResolvedValue(null);
    prismaServiceMock.user.findMany.mockResolvedValue([]);
    prismaServiceMock.user.create.mockResolvedValue({
      id: 'user1',
      name: 'Alice',
      boardId: 'board1',
      isModerator: true,
    });
    prismaServiceMock.board.findUnique.mockResolvedValue({ id: 'board1' });
    boardServiceMock.findOne = jest.fn().mockResolvedValue({
      users: [{ id: 'user1', name: 'Alice', isModerator: true }],
    });

    const client = {
      data: {},
      join: jest.fn(),
      to: jest.fn(() => ({ emit: jest.fn() })),
      emit: jest.fn(),
    };
    await gateway.handleJoinBoard(
      { boardId: 'board1', userName: 'Alice' },
      client as any,
    );

    expect(prismaServiceMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Alice',
          boardId: 'board1',
          isModerator: true,
        }),
      }),
    );
    expect(client.emit).toHaveBeenCalledWith('userJoined', { userId: 'user1' });
  });

  it('should update user vote and emit userListUpdated', async () => {
    const client = {
      data: { userId: 'user1', boardId: 'board1' },
      to: jest.fn(() => ({ emit: jest.fn() })),
      emit: jest.fn(),
    };
    prismaServiceMock.user.update.mockResolvedValue({});
    boardServiceMock.findOne = jest.fn().mockResolvedValue({
      users: [{ id: 'user1', vote: '3', hasVoted: true }],
    });

    await gateway.handleSubmitVote({ vote: '3' }, client as any);

    expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user1', boardId: 'board1' },
      data: { vote: '3', hasVoted: true },
    });
    expect(client.emit).toHaveBeenCalledWith('userListUpdated', [
      { id: 'user1', vote: '3', hasVoted: true },
    ]);
  });

  it('should emit votesRevealed if moderator', async () => {
    const client = {
      data: { userId: 'mod1', boardId: 'board1' },
      to: jest.fn(() => ({ emit: jest.fn() })),
      emit: jest.fn(),
    };
    prismaServiceMock.user.findUnique.mockResolvedValue({
      id: 'mod1',
      isModerator: true,
    });
    boardServiceMock.setRevealed = jest.fn();
    boardServiceMock.findOne = jest
      .fn()
      .mockResolvedValue({ users: [{ id: 'mod1', vote: '5' }] });

    await gateway.handleRevealVotes(client as any);

    expect(client.emit).toHaveBeenCalledWith('votesRevealed', {
      users: [{ id: 'mod1', vote: '5' }],
    });
  });

  it('should emit boardReset if moderator', async () => {
    const client = {
      data: { userId: 'mod1', boardId: 'board1' },
      to: jest.fn(() => ({ emit: jest.fn() })),
      emit: jest.fn(),
    };
    prismaServiceMock.user.findUnique.mockResolvedValue({
      id: 'mod1',
      isModerator: true,
    });
    boardServiceMock.resetVotes = jest.fn();
    boardServiceMock.findOne = jest
      .fn()
      .mockResolvedValue({ users: [{ id: 'mod1', vote: null }] });

    await gateway.resetBoard(client as any);

    expect(client.emit).toHaveBeenCalledWith('boardReset', {
      users: [{ id: 'mod1', vote: null }],
    });
  });

  it('should emit error if non-moderator tries to reveal votes', async () => {
    const client = {
      data: { userId: 'user1', boardId: 'board1' },
      emit: jest.fn(),
    };
    prismaServiceMock.user.findUnique.mockResolvedValue({
      id: 'user1',
      isModerator: false,
    });

    await gateway.handleRevealVotes(client as any);

    expect(client.emit).toHaveBeenCalledWith('error', {
      message: 'Not authorized',
    });
  });

  it('should not throw if disconnect is called with no userId/boardId', async () => {
    const client = { data: {} };
    await expect(
      gateway.handleDisconnect(client as any),
    ).resolves.not.toThrow();
  });
});
