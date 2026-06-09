import { useEffect, useCallback, RefObject } from "react";

/**
 * Options for `useEnterKey`.
 */
export interface UseEnterKeyOptions {
  /**
   * When true the handler won't fire if a modifier key (Ctrl / Shift / Alt / Meta)
   * is held at the same time. Useful to preserve shortcuts like Ctrl+Enter.
   * @default true
   */
  ignoreModifiers?: boolean;

  /**
   * When true the handler won't fire when the focused element is inside a <form>.
   * Keeps native form-submission behaviour intact.
   * @default false
   */
  skipInsideForm?: boolean;

  /**
   * Scope the listener to a specific DOM element instead of `document`.
   * Pass a React ref created with `useRef<HTMLElement>(null)`.
   * Useful when you only want Enter to work inside a modal, card, etc.
   *
   * @example
   * const cardRef = useRef<HTMLDivElement>(null);
   * useEnterKey(handleSubmit, { containerRef: cardRef });
   * // <div ref={cardRef}>…</div>
   */
  containerRef?: RefObject<HTMLElement>;

  /**
   * Set to `false` to temporarily disable the listener without unmounting.
   * @default true
   */
  enabled?: boolean;
}

/**
 * useEnterKey — React hook that calls `handler` whenever the Enter key is pressed.
 *
 * - Zero dependencies beyond React itself.
 * - Cleans up the event listener automatically on unmount or when options change.
 * - Works alongside the global `initKeyboardAccessibility()` without conflicts;
 *   the handler calls `event.preventDefault()` so the global fallback skips it.
 *
 * @param handler  Callback invoked with the raw `KeyboardEvent`.
 * @param options  Optional configuration (see `UseEnterKeyOptions`).
 *
 * @example — Trigger a submit action from any input in a card
 * ```tsx
 * function LoginCard() {
 *   const cardRef = useRef<HTMLDivElement>(null);
 *   useEnterKey(() => handleSubmit(), { containerRef: cardRef });
 *   return <div ref={cardRef}>…</div>;
 * }
 * ```
 *
 * @example — Global listener that ignores modifier keys
 * ```tsx
 * useEnterKey((e) => { e.preventDefault(); doAction(); });
 * ```
 *
 * @example — Disable while a request is in-flight
 * ```tsx
 * useEnterKey(handleSubmit, { enabled: !isLoading });
 * ```
 */
export function useEnterKey(
  handler: (event: KeyboardEvent) => void,
  options: UseEnterKeyOptions = {},
): void {
  const {
    ignoreModifiers = true,
    skipInsideForm = false,
    containerRef,
    enabled = true,
  } = options;

  // Wrap the handler so it always sees the latest closure values without
  // needing to re-register the event listener on every render.
  const stableHandler = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;

      // Modifier key guard
      if (
        ignoreModifiers &&
        (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey)
      ) {
        return;
      }

      // Skip when inside a real <form> if requested
      if (
        skipInsideForm &&
        event.target instanceof HTMLElement &&
        !!event.target.closest("form")
      ) {
        return;
      }

      handler(event);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handler, ignoreModifiers, skipInsideForm],
  );

  useEffect(() => {
    if (!enabled) return;

    const target: EventTarget = containerRef?.current ?? document;
    target.addEventListener("keydown", stableHandler as EventListener);

    return () => {
      target.removeEventListener("keydown", stableHandler as EventListener);
    };
  }, [stableHandler, containerRef, enabled]);
}
