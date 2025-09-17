"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import type { User } from "@/app/types/User";
import type { VoteData } from "@/app/types/VoteData";
import JoinBoardForm from "@/app/components/JoinBoardForm";
import ParticipantsList from "@/app/components/ParticipantsList";
import VotingPanel from "@/app/components/VotingPanel";
import ResultsPanel from "@/app/components/ResultsPanel";

const fibonacciPoints = [1, 2, 3, 5, 8, 13, 21, 34, "?", "☕"];

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#F9A826",
];

export default function BoardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const boardId = params.id as string;

  const [userName, setUserName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<string | undefined>(
    undefined
  );
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const socketRef = useRef<Socket | null>(null);

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
  }, [boardId]);

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
  }, [searchParams, users.length, currentUser]);

  useEffect(() => {
    if (!socketRef.current) {
      const BACKEND_URL =
        process.env.NEST_PUBLIC_BACKEND_URL || "http://localhost:3005";
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
  }, [boardId, userName, hasJoined]);

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
  }, [boardId, currentUser]);

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("userName");
    navigator.clipboard.writeText(url.toString());
    setShowCopyNotification(true);
    setTimeout(() => setShowCopyNotification(false), 2000);
  };

  const handleJoinBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    setUserName(userName.trim());
    setHasJoined(true);
  };

  const handleVote = async (point: string) => {
    setSelectedPoint(point);

    // Emit vote via socket.io instead of REST
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("submitVote", { vote: point });
  };

  const revealResults = () => {
    const socket = socketRef.current;
    if (!socket) return;

    if (userName && hasJoined) {
      socket.emit("revealVotes");
    }
  };

  const resetVoting = () => {
    const socket = socketRef.current;
    if (!socket) return;

    if (userName && hasJoined) {
      socket.emit("resetBoard");
    }
  };

  const getVoteData = (): VoteData[] => {
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
  };

  if (!currentUser) {
    return (
      <JoinBoardForm
        userName={userName}
        setUserName={setUserName}
        handleJoinBoard={handleJoinBoard}
      />
    );
  }

  const voteData = getVoteData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        {showCopyNotification && (
          <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-4 py-2 rounded shadow">
            Link copied to clipboard!
          </div>
        )}
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Sprint Planning Board
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Board ID: {boardId} {isModerator && " • Moderator"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 dark:text-white font-semibold rounded transition-colors cursor-pointer"
          >
            Invite Others!
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ParticipantsList
            users={users}
            currentUser={currentUser}
            showResults={showResults}
          />

          {/* Voting Area / Results */}
          <div className="lg:col-span-2">
            {!showResults ? (
              <VotingPanel
                fibonacciPoints={fibonacciPoints}
                selectedPoint={selectedPoint}
                handleVote={handleVote}
                isModerator={isModerator}
                revealResults={revealResults}
                users={users}
              />
            ) : (
              <ResultsPanel
                voteData={voteData}
                isModerator={isModerator}
                resetVoting={resetVoting}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
