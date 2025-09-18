import React from "react";
import { render, screen } from "@testing-library/react";
import ResultsPanel from "../ResultsPanel";

const voteData = [
  { value: "3", count: 2, color: "#0088FE" },
  { value: "5", count: 1, color: "#00C49F" },
];

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((msg) => {
    if (
      typeof msg === "string" &&
      msg.includes(
        "The width(0) and height(0) of chart should be greater than 0"
      )
    ) {
      return;
    }
    // @ts-expect-error: allow fallback to original console.warn for non-matching messages
    return console.warn(msg);
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

it("renders vote results and distribution", () => {
  render(
    <ResultsPanel
      voteData={voteData}
      isModerator={true}
      resetVoting={jest.fn()}
    />
  );
  expect(screen.getByText("Voting Results")).toBeInTheDocument();
  expect(screen.getByText("3 points")).toBeInTheDocument();
  expect(screen.getByText("2 votes")).toBeInTheDocument();
});
