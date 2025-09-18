"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [userName, setUserName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Trap focus in modal when open
  useEffect(() => {
    if (!showModal) return;
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'input, button, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusableElements?.[0];
    const last = focusableElements?.[focusableElements.length - 1];

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowModal(false);
      }
      if (
        e.key === "Tab" &&
        focusableElements &&
        focusableElements.length > 0
      ) {
        if (document.activeElement === last && !e.shiftKey) {
          e.preventDefault();
          first?.focus();
        } else if (document.activeElement === first && e.shiftKey) {
          e.preventDefault();
          last?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    first?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError("Please enter a valid name.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });

      if (!response.ok) throw new Error("Failed to create board");

      const newBoard: { id: string; userId: string } = await response.json();

      localStorage.setItem(`board:${newBoard.id}:userId`, newBoard.userId);
      localStorage.setItem(`board:${newBoard.id}:userName`, userName.trim());
      localStorage.setItem(`board:${newBoard.id}:isModerator`, "true");

      router.push(`/board/${newBoard.id}`);
    } catch (error) {
      setLoading(false);
      console.error(`Error creating board: ${error}`);
    }
  };

  return (
    <>
      <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center p-4 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-6">
                <span className="text-4xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-16 text-primary-900 dark:text-white"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3"
                    />
                  </svg>
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Welcome to{" "}
                <span className="text-primary-600 dark:text-primary-400">
                  Just Pick 3!
                </span>
              </h1>
              <p className="text-xl text-gray-800 dark:text-gray-200 mb-8 max-w-2xl mx-auto">
                Streamline your agile planning with our minimalist story point
                poker app. Focus on what matters - quick, consensus-driven
                estimation.
              </p>
            </div>

            {/* CTA Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to start estimating?
              </h2>
              <p className="text-gray-800 dark:text-gray-200 mb-8">
                Create a new poker board and invite your team members to join
                the session.
              </p>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-primary-900 dark:text-white font-semibold rounded-lg transition-colors duration-200 transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Create New Board
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </button>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                No account required • Free forever
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-900 dark:text-white">
                    1
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Create Board
                </h3>
                <p className="text-gray-800 dark:text-gray-400">
                  Click the button above to create a new estimation board
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-900 dark:text-white">
                    2
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Invite Team
                </h3>
                <p className="text-gray-800 dark:text-gray-400">
                  Share the unique link with your team members
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-900 dark:text-white">
                    3
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Start Voting
                </h3>
                <p className="text-gray-800 dark:text-gray-400">
                  Discuss stories and vote simultaneously
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md"
          >
            <h2
              id="modal-title"
              className="text-xl font-bold mb-4 text-gray-900 dark:text-white"
            >
              Enter your name
            </h2>
            <form
              onSubmit={(e) => {
                handleCreateBoard(e);
              }}
            >
              {error && (
                <div
                  id="userName-error"
                  className="mb-2 text-red-600 dark:text-red-400 text-sm"
                >
                  {error}
                </div>
              )}
              <label htmlFor="userName" className="sr-only">
                Your name
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                required
                aria-describedby={error ? "userName-error" : undefined}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  ref={cancelButtonRef}
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-primary-900 dark:text-white bg-primary-600 dark:bg-primary-500 font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    userName.trim().length < 1 || loading
                      ? "disabled:cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  disabled={userName.trim().length < 1}
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
