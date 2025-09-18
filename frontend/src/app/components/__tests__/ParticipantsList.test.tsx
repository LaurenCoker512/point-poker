import React from "react";
import { render, screen } from "@testing-library/react";
import ParticipantsList from "../ParticipantsList";

const users = [
  { id: "1", name: "Alice", isModerator: true, hasVoted: true, vote: "3" },
  { id: "2", name: "Bob", isModerator: false, hasVoted: false, vote: null },
];

it("renders participants and highlights current user", () => {
  render(
    <ParticipantsList
      users={users}
      currentUser={users[0]}
      showResults={false}
    />
  );
  expect(screen.getByText("Alice")).toBeInTheDocument();
  expect(screen.getByText("Bob")).toBeInTheDocument();
  expect(screen.getByText("Participants (2)")).toBeInTheDocument();
});
