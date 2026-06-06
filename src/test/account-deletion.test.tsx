import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { AppProvider, useApp } from "@/lib/store";
import { MemoryRouter } from "react-router-dom";

// Helper component that exposes the store state and dispatch for testing
function TestHarness({
  onReady,
}: {
  onReady: (helpers: {
    getState: () => ReturnType<typeof useApp>["state"];
    dispatch: ReturnType<typeof useApp>["dispatch"];
  }) => void;
}) {
  const { state, dispatch } = useApp();
  const stateRef = React.useRef(state);
  stateRef.current = state;

  React.useEffect(() => {
    onReady({
      getState: () => stateRef.current,
      dispatch,
    });
  }, []);

  return (
    <div>
      <span data-testid="user-status">
        {state.currentUser ? state.currentUser.accountStatus || "active" : "no-user"}
      </span>
      <span data-testid="user-id">
        {state.currentUser?.id || "none"}
      </span>
    </div>
  );
}

describe("72-hour Account Deletion", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("scheduleDeleteUser sets status to pending_deletion with a deactivatedAt timestamp", async () => {
    let helpers: any;

    render(
      <MemoryRouter>
        <AppProvider>
          <TestHarness onReady={(h) => (helpers = h)} />
        </AppProvider>
      </MemoryRouter>
    );

    // Create and set a test user
    act(() => {
      helpers.dispatch({
        type: "setCurrentUser",
        payload: {
          id: "test_user_1",
          name: "Test User",
          accountStatus: "active",
        },
      });
    });

    expect(helpers.getState().currentUser?.id).toBe("test_user_1");
    expect(helpers.getState().currentUser?.accountStatus).toBe("active");

    // Schedule deletion
    act(() => {
      helpers.dispatch({
        type: "scheduleDeleteUser",
        payload: { id: "test_user_1" },
      });
    });

    expect(helpers.getState().currentUser?.accountStatus).toBe("pending_deletion");
    expect(helpers.getState().currentUser?.deactivatedAt).toBeDefined();
  });

  it("cancelDeleteUser reactivates the account", async () => {
    let helpers: any;

    render(
      <MemoryRouter>
        <AppProvider>
          <TestHarness onReady={(h) => (helpers = h)} />
        </AppProvider>
      </MemoryRouter>
    );

    act(() => {
      helpers.dispatch({
        type: "setCurrentUser",
        payload: {
          id: "test_user_2",
          name: "Test User 2",
          accountStatus: "active",
        },
      });
    });

    // Schedule then cancel
    act(() => {
      helpers.dispatch({
        type: "scheduleDeleteUser",
        payload: { id: "test_user_2" },
      });
    });

    expect(helpers.getState().currentUser?.accountStatus).toBe("pending_deletion");

    act(() => {
      helpers.dispatch({
        type: "cancelDeleteUser",
        payload: { id: "test_user_2" },
      });
    });

    expect(helpers.getState().currentUser?.accountStatus).toBe("active");
    expect(helpers.getState().currentUser?.deactivatedAt).toBeUndefined();
  });

  it("auto-deletes the account after 72 hours have passed (testing at 73 hours)", async () => {
    let helpers: any;

    // Set the current time to a known point
    const now = new Date("2026-06-01T00:00:00Z").getTime();
    vi.setSystemTime(now);

    render(
      <MemoryRouter>
        <AppProvider>
          <TestHarness onReady={(h) => (helpers = h)} />
        </AppProvider>
      </MemoryRouter>
    );

    // Create user
    act(() => {
      helpers.dispatch({
        type: "setCurrentUser",
        payload: {
          id: "test_user_3",
          name: "Test User 3",
          accountStatus: "active",
        },
      });
    });

    // Schedule deletion — this records deactivatedAt as "now" (June 1 00:00)
    act(() => {
      helpers.dispatch({
        type: "scheduleDeleteUser",
        payload: { id: "test_user_3" },
      });
    });

    const deactivatedAt = helpers.getState().currentUser?.deactivatedAt;
    expect(deactivatedAt).toBeDefined();
    expect(helpers.getState().currentUser?.accountStatus).toBe("pending_deletion");

    // User still exists at this point
    expect(helpers.getState().currentUser).toBeDefined();
    expect(helpers.getState().users["test_user_3"]).toBeDefined();

    // Advance time by 73 hours (past the 72-hour window)
    const SEVENTY_THREE_HOURS_MS = 73 * 60 * 60 * 1000;
    act(() => {
      vi.advanceTimersByTime(SEVENTY_THREE_HOURS_MS);
    });

    // After 73 hours, the auto-delete useEffect should have fired
    // and the user should be permanently deleted
    expect(helpers.getState().currentUser).toBeUndefined();
    expect(helpers.getState().users["test_user_3"]).toBeUndefined();
  });

  it("does NOT delete the account before 72 hours", async () => {
    let helpers: any;

    const now = new Date("2026-06-01T00:00:00Z").getTime();
    vi.setSystemTime(now);

    render(
      <MemoryRouter>
        <AppProvider>
          <TestHarness onReady={(h) => (helpers = h)} />
        </AppProvider>
      </MemoryRouter>
    );

    act(() => {
      helpers.dispatch({
        type: "setCurrentUser",
        payload: {
          id: "test_user_4",
          name: "Test User 4",
          accountStatus: "active",
        },
      });
    });

    act(() => {
      helpers.dispatch({
        type: "scheduleDeleteUser",
        payload: { id: "test_user_4" },
      });
    });

    // Advance 71 hours — still within the grace period
    const SEVENTY_ONE_HOURS_MS = 71 * 60 * 60 * 1000;
    act(() => {
      vi.advanceTimersByTime(SEVENTY_ONE_HOURS_MS);
    });

    // User should still exist
    expect(helpers.getState().currentUser).toBeDefined();
    expect(helpers.getState().currentUser?.accountStatus).toBe("pending_deletion");
    expect(helpers.getState().users["test_user_4"]).toBeDefined();
  });

  it("auto-deletes on load when deactivatedAt is already 73 hours old", async () => {
    // Simulate a user who scheduled deletion 73 hours ago, then closed the browser
    const SEVENTY_THREE_HOURS_MS = 73 * 60 * 60 * 1000;
    const pastTimestamp = new Date(Date.now() - SEVENTY_THREE_HOURS_MS).toISOString();

    // Pre-seed localStorage with a user whose deletion window expired
    const preloadedState = {
      currentUser: {
        id: "test_user_5",
        name: "Test User 5",
        accountStatus: "pending_deletion",
        deactivatedAt: pastTimestamp,
      },
      users: {
        test_user_5: {
          id: "test_user_5",
          name: "Test User 5",
          accountStatus: "pending_deletion",
          deactivatedAt: pastTimestamp,
        },
      },
      posts: {},
      projects: {},
      responses: {},
      reviews: {},
      requests: {},
      notifications: {},
    };

    localStorage.setItem("devsync_app_state_v3", JSON.stringify(preloadedState));

    let helpers: any;

    // Render — AppProvider's useEffect should see the expired account and delete it
    await act(async () => {
      render(
        <MemoryRouter>
          <AppProvider>
            <TestHarness onReady={(h) => (helpers = h)} />
          </AppProvider>
        </MemoryRouter>
      );
    });

    // Flush any pending timers/effects
    act(() => {
      vi.runAllTimers();
    });

    // Account should have been auto-deleted
    expect(helpers.getState().currentUser).toBeUndefined();
    expect(helpers.getState().users["test_user_5"]).toBeUndefined();
  });
});
