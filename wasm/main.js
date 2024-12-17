import { Calculator } from "./Calculator.js"
import { initKeyboard } from "./keyboard.js";
import { runMathsTests } from "./tester_wasm.js";

export const calculator = new Calculator(document.getElementById("calculator"));

async function initializeApp() {

    // initKeyboard(calculator);

    await calculator.initializeParser(); // we're async because we need to make sure the WASM parser is loaded

    calculator.initialize();

    runMathsTests(calculator);    
}

// Call the async initialization function
initializeApp();