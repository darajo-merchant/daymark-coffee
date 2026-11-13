// Shared by the server layout (inline head script) and the client PageTransition.
// Set just before leaving a page; the next page reads it so the curtain is already
// closed at first paint, then PageTransition lifts it away.
export const TRANSITION_KEY = "daymark-transition";

/** Runs in <head> before paint: marks the page as "arriving" when we came through the curtain. */
export const arrivingScript = `try{var t=sessionStorage.getItem("${TRANSITION_KEY}");if(t){sessionStorage.removeItem("${TRANSITION_KEY}");if(Date.now()-Number(t)<5000&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-arriving","")}}catch(e){}`;
