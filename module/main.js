import { Calculator } from "./Calculator.js"
import { initKeyboard } from "./keyboard.js";
// ----------------------------------------------------------------
// --- Instantiate the Calculator ---
export const calculator = new Calculator(document.getElementById("calculator"));
initKeyboard(calculator);
// ----------------------------------------------------------------
