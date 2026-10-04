/**
 * Workaround for a Galyan UI 1.0.8 bug: ~200 component rules group `[data-theme=samantrix]`
 * with their dark-mode selectors (e.g. the active card-tab gets `background:#1e293b
 * !important`), so the Samantrix *light* theme renders dark patches.
 *
 * Every one of those rules is a dark-mode rule, and Galyan's light palette is keyed on
 * `data-brand="samantrix"` + `data-color-mode="light"`, not on `data-theme`. So keeping
 * <html data-theme> off "samantrix" disables exactly the buggy rules. Galyan's
 * ThemeProvider writes `data-theme="samantrix"` on mount; this observer (installed in
 * <head> before hydration) flips it back in a microtask, i.e. before the next paint.
 *
 * Remove once Galyan drops `[data-theme=samantrix]` from its dark selectors.
 */
export const LIGHT_THEME_ATTR = "samantrix-light";

export const themeGuardScript = `(function(){var r=document.documentElement,v=${JSON.stringify(
  LIGHT_THEME_ATTR,
)};function fix(){if(r.getAttribute("data-theme")==="samantrix")r.setAttribute("data-theme",v);}fix();new MutationObserver(fix).observe(r,{attributes:true,attributeFilter:["data-theme"]});})();`;
