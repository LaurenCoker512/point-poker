import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JoinBoardForm from "../JoinBoardForm";

function Wrapper({
  handleJoinBoard,
}: {
  handleJoinBoard: (e: React.FormEvent) => void;
}) {
  const [userName, setUserName] = useState("");
  return (
    <JoinBoardForm
      userName={userName}
      setUserName={setUserName}
      handleJoinBoard={handleJoinBoard}
    />
  );
}

it("renders and submits the form", async () => {
  const handleJoinBoard = jest.fn((e) => e.preventDefault());

  render(<Wrapper handleJoinBoard={handleJoinBoard} />);

  const input = screen.getByPlaceholderText("Enter your name");
  await userEvent.type(input, "Alice");

  const button = screen.getByText("Join Board");
  await userEvent.click(button);
  expect(button).not.toBeDisabled();
  expect(handleJoinBoard).toHaveBeenCalled();
});
