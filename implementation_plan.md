# Implementation Plan

## Overview

Apply a minimal, targeted UX correction pass to the Dragon Ball Ki clicker so the prestige flow, tap gain display, offline recovery message, random drops, energy guidance, and secret unlock presentation all match the game’s real behavior.

This implementation stays inside the current client-side architecture and focuses on copy, derived values, and small UI positioning adjustments. The core reset economy, storage key `dragonBallKiState`, card IDs, boost IDs, quest IDs, and existing progression math remain unchanged. The main work is to ensure the UI never implies that rebirth preserves owned cards, that displayed tap values always match actual gain during boosts, and that recovery/secret systems are readable without adding new game systems.

## Types

Introduce only the smallest necessary prop/state additions to support accurate UI rendering and offline recovery display.

- `GokuClickerProps.actualTapGain?: number`
  - Numeric value representing the real Ki earned per tap after all active multipliers.
  - Used only for display in the tap label and floater.
  - Must stay in sync with the exact value used by `handleClickKi`.

- `SavedGameState` extension in `app/page.tsx`
  - Add no new persisted keys unless required for existing behavior.
  - No storage key changes.
  - No changes to `dragonBallKiState`.

- `offlineEnergyRecovered` state in `app/page.tsx`
  - `number`
  - Holds the recovered energy amount from the offline restore calculation.
  - Display-only state; does not alter restore math.

- Optional derived helpers in `app/page.tsx`
  - `tapKiGain: number`
  - Derived from `levelMultiplier * currentMultiplier`.
  - Used in click handling and passed to `GokuClicker`.

No new global types, enums, or data structures are required.

## Files

Single-sentence summary: Modify only the files directly involved in the UX corrections and keep the scope tightly localized.

### Existing files to modify

- `app/page.tsx`
  - Add a single derived tap gain value and use it in click handling and the clicker props.
  - Add offline energy recovery state and render it in the offline popup.
  - Rewrite rebirth/prestige copy to avoid implying retained owned cards and to accurately describe kept secret unlock records.
  - Clarify prestige bonus copy so it states what is affected.
  - Improve secret unlock presentation in the quests tab with presentation-only changes.
  - Keep existing reset/reset-storage behavior unchanged.

- `components/GokuClicker.tsx`
  - Accept the actual tap gain prop.
  - Use it for the floating click value and the `+X Ki` label above the character.
  - Improve low-energy and empty-energy copy.
  - Constrain random drop placement to a safer play region without changing drop logic or reward type.

- `components/MiningStore.tsx`
  - Modify only if a very small copy adjustment is needed to support better energy/boost clarity.
  - Otherwise leave untouched.

### Files not to modify

- `app/layout.tsx`
- `app/globals.css`
- `components/BottomNav.tsx`
- `components/DragonBallIcon.tsx`
- `hooks/use-mobile.ts`
- `lib/gameConstants.ts`
- `lib/utils.ts`

No files need to be moved or deleted.

## Functions

Single-sentence summary: Update only the small functions and handlers needed to keep UI values and labels truthful.

### `app/page.tsx`

- `const tapKiGain = levelMultiplier * currentMultiplier`
  - Purpose: a single source of truth for tap reward display and click reward application.
  - Parameters: none.
  - Returns: `number`.
  - Implementation: derive once per render and reuse in both `handleClickKi` and props.
  - Error handling: none beyond existing numeric coercion already used in the file.

- `handleClickKi()`
  - Purpose: apply Ki gain from a click and reduce energy.
  - Parameters: none.
  - Returns: void.
  - Implementation: use `tapKiGain` rather than recomputing a separate gain inside the handler.
  - Error handling: preserve the existing energy guard.

- Offline restore block inside the initial `useEffect`
  - Purpose: compute offline Ki and offline energy recovery.
  - Parameters: none.
  - Returns: void.
  - Implementation: store the computed recovered energy in `offlineEnergyRecovered`, and keep the Ki popup tied to Ki earned.
  - Error handling: preserve existing parse fallback behavior.

- `confirmPrestige()`
  - Purpose: reset run-based state.
  - Parameters: none.
  - Returns: void.
  - Implementation: no economy changes; copy only.
  - Error handling: unchanged.

### `components/GokuClicker.tsx`

- `handleClick(event)`
  - Purpose: spawn the floating value and forward the click.
  - Parameters: mouse click event.
  - Returns: void.
  - Implementation: display `actualTapGain` and pass the click through unchanged.
  - Error handling: unchanged.

- Random drop placement rendering
  - Purpose: keep drops visible and tappable in safer screen regions.
  - Parameters: random drop state.
  - Returns: JSX.
  - Implementation: clamp incoming coordinates to safer bounds if necessary.
  - Error handling: no new failure modes.

### `components/MiningStore.tsx`

- No required function changes expected.
  - Only update text if needed.

## Changes

Single-sentence summary: Implement the smallest possible set of changes that make the visible UI honest and readable while leaving the game economy and state model intact.

1. In `app/page.tsx`, define a single derived `tapKiGain` from `levelMultiplier * currentMultiplier` and use it in `handleClickKi` so click math and displayed click math cannot drift.
2. Pass `tapKiGain` into `GokuClicker` as a new prop and stop using `levelMultiplier` as the displayed click value.
3. Add `offlineEnergyRecovered` state and populate it during local save restoration alongside `offlineKiEarned`.
4. Update the offline popup copy so it explicitly shows both Ki earned and Energy recovered; hide the energy line when the recovered amount is zero.
5. Rewrite rebirth/prestige copy in the wallet section and modal:
   - remove wording that suggests owned secret cards persist as cards
   - replace it with `secret unlock records`, `unlocked reward status`, or similar truthful language
   - keep Dragon Balls and permanent achievements as the kept items
6. Clarify the prestige bonus text in the wallet so it explicitly states it affects tap gain and passive Ki generation if that matches the actual multiplier flow.
7. Improve the quest tab `Secret Unlocks` block by making each unlock read more like a distinct rewarded record:
   - stronger badge/label treatment
   - cleaner display text
   - optional presentation-only removal of the `Secret Card:` prefix
   - no data mutation
8. In `components/GokuClicker.tsx`, accept the new actual tap gain prop, use it for:
   - floating tap values
   - the `+X Ki` label above the character
   - any related tap-value copy
9. Improve low-energy and empty-energy helper text so it clearly suggests recharge, passive income, or Mining access without changing mechanics.
10. Constrain random drop positioning to a safer play area by narrowing the allowed `x`/`y` range and/or clamping drop placement inside the button/play region.
11. Review `components/MiningStore.tsx` for any direct copy alignment needed for boosts/energy, and only change it if there is a direct UX benefit.
12. Keep all gameplay math, storage keys, IDs, and reward values unchanged.

## Tests

Single-sentence summary: Validate the UX changes manually and with a build/type check, since no new dependencies or major logic paths are being introduced.

- Unit tests to be written
  - None required for this small UI-only pass unless the project already has an existing test setup for these components.
- Integration tests needed
  - Verify tap gain display matches actual click gain with and without active boosts.
  - Verify rebirth modal and wallet copy no longer imply retained owned cards.
  - Verify offline popup shows recovered energy only when greater than zero.
  - Verify random drops still appear and are clickable on mobile-sized layouts.
  - Verify low-energy messaging appears at the right thresholds.
- Test data requirements
  - Use current in-app state and existing localStorage restoration behavior.
  - No new fixtures or seeded data required.
- Edge cases to cover
  - No active boost.
  - Active boost present.
  - Zero offline energy recovered.
  - Very low energy and zero energy states.
  - Prestige available versus unavailable.
  - No secret unlocks versus one or more unlocks.
- Performance considerations
  - Keep all changes render-local and derived; do not add extra polling, storage writes, or new effect loops.
  - Preserve current animation behavior and avoid expensive layout calculations.
