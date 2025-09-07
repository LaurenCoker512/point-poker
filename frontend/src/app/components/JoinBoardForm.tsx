import { Target } from "lucide-react";

type JoinBoardFormProps = {
  userName: string;
  setUserName: (name: string) => void;
  handleJoinBoard: (e: React.FormEvent) => void;
};

export default function JoinBoardForm({
  userName,
  setUserName,
  handleJoinBoard,
}: JoinBoardFormProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Target className="mx-auto h-12 w-12 text-primary-600 dark:text-primary-400" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Join Planning Board
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your name to join the estimation session
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleJoinBoard}>
          <div>
            <label
              htmlFor="userName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Your Name
            </label>
            <input
              id="userName"
              name="userName"
              type="text"
              required
              className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg dark:text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
            disabled={userName.trim().length < 1}
          >
            Join Board
          </button>
        </form>
      </div>
    </div>
  );
}
