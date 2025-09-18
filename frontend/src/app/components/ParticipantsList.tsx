import React from "react";
import { Crown, Users, CheckCircle2 } from "lucide-react";
import type { User } from "@/app/types/User";

type ParticipantsListProps = {
  users: User[];
  currentUser: User;
  showResults: boolean;
};

export default function ParticipantsList({
  users,
  currentUser,
  showResults,
}: ParticipantsListProps) {
  const sortedUsers = [...users].sort((a, b) => {
    if (a.isModerator && !b.isModerator) return -1;
    if (!a.isModerator && b.isModerator) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="lg:col-span-1">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <Users className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Participants ({users.length})
          </h2>
        </div>

        <div className="space-y-3">
          {sortedUsers.map((user) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                user.id === currentUser.id
                  ? "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700"
                  : "bg-gray-50 dark:bg-gray-700/50"
              }`}
            >
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name}
                </span>
                {user.isModerator && (
                  <Crown className="w-4 h-4 text-yellow-500 ml-2" />
                )}
              </div>

              <div className="flex items-center">
                {user.hasVoted ? (
                  showResults ? (
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {user.vote}
                    </span>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )
                ) : (
                  <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
