import { useEffect } from "react";

export function useRestoreUserSession(
  boardId: string,
  setUserName: (name: string) => void,
  setHasJoined: (joined: boolean) => void,
  setIsModerator: (isMod: boolean) => void,
  users: any[],
  currentUser: any,
  searchParams: any
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
