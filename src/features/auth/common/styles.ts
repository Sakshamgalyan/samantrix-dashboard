/**
 * Chrome paints autofilled inputs with its own background, which shows as a
 * two-tone block inside Galyan's Input. Repaint it with the field's
 * token colour via an inset shadow (the only property autofill can't override).
 */
export const AUTOFILL_FIX =
  "[&_input:-webkit-autofill]:shadow-[inset_0_0_0_1000px_var(--gy-surface)] [&_input:-webkit-autofill]:[-webkit-text-fill-color:var(--gy-text)] [&_input:-webkit-autofill]:[caret-color:var(--gy-text)]";
