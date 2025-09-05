import { Test, TestingModule } from '@nestjs/testing';
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
      updateMany: jest.fn(),
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
      ],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
