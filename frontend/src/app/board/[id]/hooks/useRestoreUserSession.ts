import { useEffect } from "react";
import { User } from "@/app/types/User";

export function useRestoreUserSession(
  boardId: string,
  setUserName: (name: string) => void,
  setHasJoined: (joined: boolean) => void,
  setIsModerator: (isMod: boolean) => void,
  users: User[],
  currentUser: User | null,
  searchParams: URLSearchParams | null
) {
  useEffect(() => {
    const storedUserId = localStorage.getItem(`board:${boardId}:userId`);
    const storedUserName = localStorage.getItem(`board:${boardId}:userName`);
    const storedIsModerator = localStorage.getItem(
      `board:${boardId}:isModerator`
    );
    if (storedUserId && storedUserName) {
      setUserName(storedUserName);
      setHasJoined(true);
      setIsModerator(storedIsModerator === "true");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, searchParams, users.length, currentUser]);
}
