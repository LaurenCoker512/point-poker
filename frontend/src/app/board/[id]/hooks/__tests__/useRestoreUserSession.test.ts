import { renderHook } from "@testing-library/react";
import { useRestoreUserSession } from "../useRestoreUserSession";

describe("useRestoreUserSession", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("restores user session from localStorage", () => {
    localStorage.setItem("board:board1:userId", "user1");
    localStorage.setItem("board:board1:userName", "Alice");
    localStorage.setItem("board:board1:isModerator", "true");

    const setUserName = jest.fn();
    const setHasJoined = jest.fn();
    const setIsModerator = jest.fn();

    renderHook(() =>
      useRestoreUserSession(
        "board1",
        setUserName,
        setHasJoined,
        setIsModerator,
        [],
        null,
        null
      )
    );

    expect(setUserName).toHaveBeenCalledWith("Alice");
    expect(setHasJoined).toHaveBeenCalledWith(true);
    expect(setIsModerator).toHaveBeenCalledWith(true);
  });
});
