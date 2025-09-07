export interface User {
  id: string;
  name: string;
  isModerator: boolean;
  vote?: string;
  hasVoted: boolean;
}
