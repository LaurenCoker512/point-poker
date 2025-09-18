"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import type { User } from "@/app/types/User";
import JoinBoardForm from "@/app/components/JoinBoardForm";
import ParticipantsList from "@/app/components/ParticipantsList";
import VotingPanel from "@/app/components/VotingPanel";
import ResultsPanel from "@/app/components/ResultsPanel";
import { useBoardSocket } from "./hooks/useBoardSocket";
import { useBoardFetch } from "./hooks/useBoardFetch";
import { useRestoreUserSession } from "./hooks/useRestoreUserSession";
import { getVoteData } from "./utils/getVoteData";
import { handleCopyLink } from "./utils/handleCopyLink";
import { fibonacciPoints, COLORS } from "./constants";

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

  const socketRef = useBoardSocket({
    boardId,
    userName,
    hasJoined,
    setUsers,
    setCurrentUser,
    setIsModerator,
    setShowResults,
    setSelectedPoint,
  });

  useBoardFetch(
    boardId,
    currentUser,
    setUsers,
    setShowResults,
    setCurrentUser,
    setIsModerator,
    setSelectedPoint
  );

  useRestoreUserSession(
    boardId,
    setUserName,
    setHasJoined,
    setIsModerator,
    users,
    currentUser,
    searchParams
  );

  const handleJoinBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    setUserName(userName.trim());
    setHasJoined(true);
  };

  const handleVote = async (point: string) => {
    setSelectedPoint(point);

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

  if (!currentUser) {
    return (
      <JoinBoardForm
        userName={userName}
        setUserName={setUserName}
        handleJoinBoard={handleJoinBoard}
      />
    );
  }

  const voteData = getVoteData(users, COLORS);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        {showCopyNotification && (
          <div
            className="fixed top-6 right-6 z-50 bg-green-600 text-white px-4 py-2 rounded shadow"
            role="status"
            aria-live="polite"
          >
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
            onClick={() => handleCopyLink(setShowCopyNotification)}
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
