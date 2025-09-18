import { useEffect } from "react";
import type { User } from "@/app/types/User";

export function useBoardFetch(
  boardId: string,
  currentUser: User | null,
  setUsers: (users: User[]) => void,
  setShowResults: (show: boolean) => void,
  setCurrentUser: (user: User) => void,
  setIsModerator: (isMod: boolean) => void,
  setSelectedPoint: (point?: string) => void
) {
  useEffect(() => {
    async function fetchBoard() {
      const userId = localStorage.getItem(`board:${boardId}:userId`);
      const res = await fetch(`/api/board/${boardId}?userId=${userId}`);
      if (res.ok) {
        const board = await res.json();
        setUsers(board.users);
        setShowResults(board.isRevealed);

        const foundUser = board.users.find((u: User) => u.id === userId);
        if (foundUser) {
          setCurrentUser(foundUser);
          setIsModerator(foundUser.isModerator ?? false);
          setSelectedPoint(foundUser.vote);
        }
      }
    }
    fetchBoard();
  }, [
    boardId,
    setUsers,
    setShowResults,
    setCurrentUser,
    setIsModerator,
    setSelectedPoint,
  ]);

  useEffect(() => {
    async function fetchBoard() {
      const res = await fetch(`/api/board/${boardId}`);
      if (res.ok) {
        const board = await res.json();
        setUsers(board.users);
        setShowResults(board.isRevealed);
        if (currentUser) {
          setIsModerator(
            board.users.find((u: User) => u.id === currentUser.id)
              ?.isModerator ?? false
          );
        }
      }
    }
    fetchBoard();
  }, [boardId, currentUser, setUsers, setShowResults, setIsModerator]);
}
