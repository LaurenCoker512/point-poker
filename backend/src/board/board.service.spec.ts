import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { PrismaService } from '../prisma/prisma.service';

const prismaServiceMock = {
  board: {
    create: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
  user: {
    create: jest.fn(),
    updateMany: jest.fn(),
  },
  $transaction: jest.fn((cb) => cb(prismaServiceMock)),
};

describe('BoardService', () => {
  let service: BoardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('can create an instance of board service', () => {
    expect(service).toBeInstanceOf(BoardService);
  });

  it('should create a board and moderator user', async () => {
    prismaServiceMock.board.create.mockResolvedValue({ id: 'board1' });
    prismaServiceMock.user.create.mockResolvedValue({ id: 'user1' });

    const dto = { userName: 'Alice' };
    const result = await service.create(dto);

    expect(prismaServiceMock.board.create).toHaveBeenCalled();
    expect(prismaServiceMock.user.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 'board1', userId: 'user1' });
  });

  it('should find one board', async () => {
    const fullBoard = {
      id: 'board1',
      name: 'Test Board',
      isRevealed: false,
      users: [
        { id: 'user1', name: 'Alice', isModerator: true, vote: 5 },
        { id: 'user2', name: 'Bob', isModerator: false, vote: null },
      ],
    };
    const fullBoardWithVotesHidden = {
      id: 'board1',
      name: 'Test Board',
      isRevealed: false,
      users: [
        { id: 'user1', name: 'Alice', isModerator: true, vote: null },
        { id: 'user2', name: 'Bob', isModerator: false, vote: null },
      ],
    };
    prismaServiceMock.board.findUnique.mockResolvedValue(fullBoard);

    const result = await service.findOne('board1');

    expect(prismaServiceMock.board.findUnique).toHaveBeenCalled();
    expect(result).toEqual(fullBoardWithVotesHidden);
  });

  it('should reset votes', async () => {
    prismaServiceMock.user.updateMany.mockResolvedValue({});
    prismaServiceMock.board.updateMany.mockResolvedValue({});

    await service.resetVotes('board1');

    expect(prismaServiceMock.user.updateMany).toHaveBeenCalledWith({
      where: { boardId: 'board1' },
      data: { vote: null, hasVoted: false },
    });
    expect(prismaServiceMock.board.updateMany).toHaveBeenCalledWith({
      where: { id: 'board1' },
      data: { isRevealed: false },
    });
  });

  it('should reveal votes in board', async () => {
    prismaServiceMock.board.updateMany.mockResolvedValue({});

    await service.setRevealed('board1');

    expect(prismaServiceMock.board.updateMany).toHaveBeenCalledWith({
      where: { id: 'board1' },
      data: { isRevealed: true },
    });
  });
});
