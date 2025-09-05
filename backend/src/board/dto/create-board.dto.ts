import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBoardDto {
  @IsString({ message: 'Username must be a string ' })
  @IsNotEmpty({ message: 'Username is required ' })
  @MinLength(1, { message: 'Username must be at least 1 character long' })
  @MaxLength(50, { message: 'Username cannot be longer than 50 characters' })
  userName: string;
}
