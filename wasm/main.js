import { Calculator } from "./Calculator.js"
import { initKeyboard } from "./keyboard.js";


export const calculator = new Calculator(document.getElementById("calculator"));

async function initializeApp() {

    initKeyboard(calculator);

    await calculator.initializeParser(); // we're async because we need to make sure the WASM parser is loaded

    calculator.initialize();
}

// Call the async initialization function
initializeApp();