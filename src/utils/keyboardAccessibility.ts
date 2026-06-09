/**
 * keyboardAccessibility.ts
 *
 * Global Enter/Space key handler for all interactive button types.
 * Covers:
 *   1. Elements with role="button" (ARIA 1.2 pattern — Enter + Space)
 *   2. Native <button> elements that are focused outside a <form> (Enter)
 *   3. <input> elements outside a <form> — finds and clicks the nearest
 *      primary action button so Enter acts as a form submit equivalent.
 *
 * Conflict avoidance:
 *   - Checks `event.defaultPrevented` to skip already-handled events.
 *   - Respects `data-no-global-enter` on a container to opt that subtree out.
 *   - Skips <textarea> inputs (Enter = newline there).
 *   - Skips inputs inside a real <form> element (browser handles those).
 *
 * Usage: Import and call `initKeyboardAccessibility()` once in your app entry point.
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns true if the element (or any ancestor) has data-no-global-enter. */
function isOptedOut(el: HTMLElement): boolean {
  return !!el.closest("[data-no-global-enter]");
}

/** Returns true if the element lives inside a native <form>. */
function isInsideForm(el: HTMLElement): boolean {
  return !!el.closest("form");
}

/**
 * Checks whether an element is a non-disabled custom role="button" element.
 */
function isActiveCustomButton(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) return false;
  const role = target.getAttribute("role");
  const isDisabled =
    target.hasAttribute("disabled") ||
    target.getAttribute("aria-disabled") === "true";
  return role === "button" && !isDisabled;
}

/**
 * Returns true when the focused element is an <input> that should trigger
 * a primary button on Enter:
 *   - Must be an HTMLInputElement (not textarea — Enter = newline there)
 *   - Must NOT be type submit/button/reset (already triggers natively)
 *   - Must NOT be inside a <form> (browser handles those natively)
 */
function isOrphanInput(target: EventTarget | null): target is HTMLInputElement {
  if (!(target instanceof HTMLInputElement)) return false;
  const type = target.type;
  if (type === "submit" || type === "button" || type === "reset") return false;
  if (isInsideForm(target)) return false;
  return true;
}

/**
 * Walks up from `origin` to find the nearest logical container, then
 * returns the best candidate "primary action" button within it.
 *
 * Priority order:
 *   1. A button with type="submit"
 *   2. The last enabled, visible button (conventionally the primary CTA)
 *   3. The first enabled button (last resort)
 */
function findPrimaryButton(origin: HTMLElement): HTMLButtonElement | null {
  // Prefer the closest semantic boundary; fall back to nearest block div.
  const container =
    origin.closest<HTMLElement>(
      "form, [role='dialog'], [role='region'], section, article, main"
    ) ??
    origin.closest<HTMLElement>("div") ??
    document.body;

  const candidates = Array.from(
    container.querySelectorAll<HTMLButtonElement>(
      "button:not([disabled]):not([tabindex='-1'])"
    )
  );

  if (candidates.length === 0) return null;

  // Explicit submit type wins
  const submitBtn = candidates.find((b) => b.type === "submit");
  if (submitBtn) return submitBtn;

  // Last button is typically the primary CTA (e.g. "Sign in", "Create account")
  return candidates[candidates.length - 1];
}

// ─── Handlers ────────────────────────────────────────────────────────────────

/**
 * Handles the Enter key:
 *
 *  Case A — role="button": triggers .click() (native buttons do this already).
 *  Case B — <input> outside a <form>: finds the nearest primary button and
 *           clicks it. Skips if the event was already handled (defaultPrevented)
 *           or the container has opted out with data-no-global-enter.
 */
function handleEnterKey(event: KeyboardEvent): void {
  if (event.key !== "Enter") return;

  // ── Case A: custom role="button" ──────────────────────────────────────────
  if (isActiveCustomButton(event.target)) {
    event.preventDefault();
    (event.target as HTMLElement).click();
    return;
  }

  // ── Case B: orphan <input> → find + click primary button ──────────────────
  if (isOrphanInput(event.target)) {
    // Skip if a closer React/DOM handler already responded.
    if (event.defaultPrevented) return;

    const input = event.target as HTMLInputElement;
    if (isOptedOut(input)) return;

    const primary = findPrimaryButton(input);
    if (primary) {
      event.preventDefault();
      primary.focus(); // surface the action visually before clicking
      primary.click();
    }
  }
}

/**
 * Handles the Space key — triggers .click() on focused role="button" elements.
 * Space on native buttons is handled by the browser already.
 * Space is required per the ARIA 1.2 button pattern specification.
 */
function handleSpaceKey(event: KeyboardEvent): void {
  if (event.key !== " " && event.key !== "Spacebar") return;
  if (isActiveCustomButton(event.target)) {
    event.preventDefault(); // Prevent page scroll
    (event.target as HTMLElement).click();
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Initializes global keyboard accessibility listeners.
 * Uses event delegation on `document` to cover dynamically added elements.
 * Safe to call multiple times — cleans up before re-attaching.
 *
 * @example
 * // Call once in your app entry point (main.tsx / index.tsx)
 * import { initKeyboardAccessibility } from "@/utils/keyboardAccessibility";
 * initKeyboardAccessibility();
 */
export function initKeyboardAccessibility(): void {
  document.removeEventListener("keydown", handleEnterKey);
  document.removeEventListener("keydown", handleSpaceKey);
  document.addEventListener("keydown", handleEnterKey);
  document.addEventListener("keydown", handleSpaceKey);
}

/**
 * Removes global keyboard accessibility listeners.
 * Call this on app unmount / test teardown if needed.
 *
 * @example
 * // In a React StrictMode cleanup or test afterEach:
 * destroyKeyboardAccessibility();
 */
export function destroyKeyboardAccessibility(): void {
  document.removeEventListener("keydown", handleEnterKey);
  document.removeEventListener("keydown", handleSpaceKey);
}

