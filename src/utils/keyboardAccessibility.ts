/**
 * keyboardAccessibility.ts
 *
 * Global Enter/Space key handler for all interactive button types.
 * Ensures custom role="button" elements respond to keyboard interaction
 * per the ARIA 1.2 button pattern specification.
 *
 * Usage: Import and call `initKeyboardAccessibility()` once in your app entry point.
 */

/**
 * Checks whether an element is a non-disabled custom button (role="button").
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
 * Handles Enter key press — triggers click on focused custom buttons.
 */
function handleEnterKey(event: KeyboardEvent): void {
  if (event.key !== "Enter") return;
  if (isActiveCustomButton(event.target)) {
    event.preventDefault();
    (event.target as HTMLElement).click();
  }
}

/**
 * Handles Space key press — triggers click on focused custom buttons.
 * Space is required per ARIA spec for role="button".
 */
function handleSpaceKey(event: KeyboardEvent): void {
  if (event.key !== " " && event.key !== "Spacebar") return;
  if (isActiveCustomButton(event.target)) {
    event.preventDefault(); // Prevent page scroll
    (event.target as HTMLElement).click();
  }
}

/**
 * Initializes global keyboard accessibility listeners.
 * Uses event delegation on `document` to cover dynamically added elements.
 * Safe to call multiple times — cleans up before re-attaching.
 */
export function initKeyboardAccessibility(): void {
  document.removeEventListener("keydown", handleEnterKey);
  document.removeEventListener("keydown", handleSpaceKey);
  document.addEventListener("keydown", handleEnterKey);
  document.addEventListener("keydown", handleSpaceKey);
}

/**
 * Removes global keyboard accessibility listeners.
 * Call this on app unmount/cleanup if needed.
 */
export function destroyKeyboardAccessibility(): void {
  document.removeEventListener("keydown", handleEnterKey);
  document.removeEventListener("keydown", handleSpaceKey);
}
