/**
 * Theme attributes and initialization helper for Simantrix Dashboard.
 */
export const LIGHT_THEME_ATTR = "simantrix-simantrix";

export const themeGuardScript = `(function(){var r=document.documentElement;r.setAttribute("data-brand","simantrix");if(!r.getAttribute("data-role"))r.setAttribute("data-role","simantrix");if(!r.getAttribute("data-theme"))r.setAttribute("data-theme","simantrix-simantrix");r.setAttribute("data-color-mode","light");})();`;