import type { User } from "@/app/types/User";

type VotingPanelProps = {
  fibonacciPoints: (number | string)[];
  selectedPoint: string | undefined;
  handleVote: (point: string) => void;
  isModerator: boolean;
  revealResults: () => void;
  users: User[];
  currentUser: User | null;
};

export default function VotingPanel({
  fibonacciPoints,
  selectedPoint,
  handleVote,
  isModerator,
  revealResults,
  users,
  currentUser,
}: VotingPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Select your estimate
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
        {fibonacciPoints.map((point, index) => (
          <button
            key={index}
            onClick={() => handleVote(point.toString())}
            className={`p-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 cursor-pointer ${
              selectedPoint === point.toString()
                ? "bg-primary-600 text-gray-900 dark:text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {point}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {selectedPoint
            ? `Selected: ${selectedPoint}`
            : "Choose your estimate"}
        </span>
      </div>

      {isModerator && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={revealResults}
            disabled={users.some((user) => !user.hasVoted)}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Reveal Results
          </button>
        </div>
      )}
    </div>
  );
}
