import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import VotingPanel from "../VotingPanel";

const fibonacciPoints = [1, 2, 3];
const users = [
  { id: "1", name: "Alice", isModerator: true, hasVoted: true, vote: "3" },
  { id: "2", name: "Bob", isModerator: false, hasVoted: false, vote: null },
];

it("renders voting options and handles vote", () => {
  const handleVote = jest.fn();
  render(
    <VotingPanel
      fibonacciPoints={fibonacciPoints}
      selectedPoint={undefined}
      handleVote={handleVote}
      isModerator={false}
      revealResults={jest.fn()}
      users={users}
    />
  );
  expect(screen.getByText("1")).toBeInTheDocument();
  fireEvent.click(screen.getByText("2"));
  expect(handleVote).toHaveBeenCalledWith("2");
});
