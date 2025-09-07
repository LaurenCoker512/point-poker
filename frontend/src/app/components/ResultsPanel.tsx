import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { VoteData } from "@/app/types/VoteData";

type ResultsPanelProps = {
  voteData: VoteData[];
  isModerator: boolean;
  resetVoting: () => void;
};

export default function ResultsPanel({
  voteData,
  isModerator,
  resetVoting,
}: ResultsPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Voting Results
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={voteData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {voteData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Vote Distribution
          </h3>
          {voteData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-900 dark:text-white">
                  {item.value} points
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.count} vote{item.count !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isModerator && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={resetVoting}
            className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            Start New Vote
          </button>
        </div>
      )}
    </div>
  );
}
