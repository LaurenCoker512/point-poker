import { renderHook } from "@testing-library/react";
import { useBoardFetch } from "../useBoardFetch";

global.fetch = jest.fn();

describe("useBoardFetch", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches board and updates state", async () => {
    const setUsers = jest.fn();
    const setShowResults = jest.fn();
    const setCurrentUser = jest.fn();
    const setIsModerator = jest.fn();
    const setSelectedPoint = jest.fn();

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: [{ id: "user1", name: "Alice", isModerator: true, vote: "3" }],
          isRevealed: false,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          users: [{ id: "user1", name: "Alice", isModerator: true, vote: "3" }],
          isRevealed: false,
        }),
      });

    jest
      .spyOn(window.localStorage.__proto__, "getItem")
      .mockImplementation((key: string) => {
        if (key === "board:board1:userId") return "user1";
        return null;
      });

    renderHook(() =>
      useBoardFetch(
        "board1",
        null,
        setUsers,
        setShowResults,
        setCurrentUser,
        setIsModerator,
        setSelectedPoint
      )
    );

    // Wait for useEffect to run
    await new Promise((r) => setTimeout(r, 0));

    expect(setUsers).toHaveBeenCalledWith([
      { id: "user1", name: "Alice", isModerator: true, vote: "3" },
    ]);
    expect(setShowResults).toHaveBeenCalledWith(false);
    expect(setCurrentUser).toHaveBeenCalled();
    expect(setIsModerator).toHaveBeenCalled();
    expect(setSelectedPoint).toHaveBeenCalled();
  });
});
