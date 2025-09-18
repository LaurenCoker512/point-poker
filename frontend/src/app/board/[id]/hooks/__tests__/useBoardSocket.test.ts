import { renderHook, act } from "@testing-library/react";
import { useBoardSocket } from "../useBoardSocket";
import { Socket } from "socket.io-client";

jest.mock("socket.io-client", () => {
  const mSocket = {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  };
  return {
    io: jest.fn(() => mSocket),
    Socket: jest.fn(),
  };
});

describe("useBoardSocket", () => {
  it("emits joinBoard when userName and hasJoined are set", () => {
    const setUsers = jest.fn();
    const setCurrentUser = jest.fn();
    const setIsModerator = jest.fn();
    const setShowResults = jest.fn();
    const setSelectedPoint = jest.fn();

    renderHook(() =>
      useBoardSocket({
        boardId: "board1",
        userName: "Alice",
        hasJoined: true,
        setUsers,
        setCurrentUser,
        setIsModerator,
        setShowResults,
        setSelectedPoint,
      })
    );

    const { io } = require("socket.io-client");
    expect(io().emit).toHaveBeenCalledWith("joinBoard", {
      boardId: "board1",
      userName: "Alice",
    });
  });
});
