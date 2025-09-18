import type { User } from "@/app/types/User";
import type { VoteData } from "@/app/types/VoteData";

export function getVoteData(users: User[], COLORS: string[]): VoteData[] {
  const votes = users
    .filter(
      (user) => user.hasVoted && user.vote !== undefined && user.vote !== null
    )
    .map((user) => user.vote);
  const voteCounts: Record<string, number> = {};

  votes.forEach((vote) => {
    const key = vote?.toString() || "unknown";
    voteCounts[key] = (voteCounts[key] || 0) + 1;
  });

  return Object.entries(voteCounts).map(([value, count], index) => ({
    value,
    count,
    color: COLORS[index % COLORS.length],
  }));
}
