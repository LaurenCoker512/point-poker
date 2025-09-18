import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { User } from "@/app/types/User";

export function useBoardSocket({
  boardId,
  userName,
  hasJoined,
  setUsers,
  setCurrentUser,
  setIsModerator,
  setShowResults,
  setSelectedPoint,
}: {
  boardId: string;
  userName: string;
  hasJoined: boolean;
  setUsers: (users: User[]) => void;
  setCurrentUser: (user: User) => void;
  setIsModerator: (isMod: boolean) => void;
  setShowResults: (show: boolean) => void;
  setSelectedPoint: (point?: string) => void;
}) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3005";
      socketRef.current = io(BACKEND_URL);
    }
    const socket = socketRef.current;

    if (userName && hasJoined) {
      socket.emit("joinBoard", { boardId, userName });
    }

    const handleUserListUpdated = (users: User[]) => {
      setUsers(users);
      const found = users.find((u) => u.name === userName);
      if (found) {
        setCurrentUser(found);
        setIsModerator(found.isModerator ?? false);
        localStorage.setItem(`board:${boardId}:userId`, found.id);
        localStorage.setItem(`board:${boardId}:userName`, found.name);
        localStorage.setItem(
          `board:${boardId}:isModerator`,
          found.isModerator ? "true" : "false"
        );
      }
    };

    const handleShowResults = (data: {
      id: string;
      name: string;
      isRevealed: boolean;
      users: User[];
    }) => {
      setUsers(data.users);
      setShowResults(true);
    };

    const handleBoardReset = (data: {
      id: string;
      name: string;
      isRevealed: boolean;
      users: User[];
    }) => {
      setUsers(data.users);
      setShowResults(false);
      setSelectedPoint(undefined);
    };

    socket.on("userListUpdated", handleUserListUpdated);
    socket.on("votesRevealed", handleShowResults);
    socket.on("boardReset", handleBoardReset);

    return () => {
      socket.off("userListUpdated", handleUserListUpdated);
      socket.off("votesRevealed", handleShowResults);
      socket.off("boardReset", handleBoardReset);
    };
  }, [
    boardId,
    userName,
    hasJoined,
    setUsers,
    setCurrentUser,
    setIsModerator,
    setShowResults,
    setSelectedPoint,
  ]);

  return socketRef;
}
