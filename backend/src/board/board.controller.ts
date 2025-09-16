import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardService.create(createBoardDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.boardService.findOne(id, userId);
  }

  @Post(':id/vote')
  submitVote(
    @Param('id') boardId: string,
    @Body() body: { userId: string; vote: string },
  ) {
    return this.boardService.submitVote(boardId, body);
  }
}
