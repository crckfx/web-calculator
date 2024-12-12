import { Calculator } from "./Calculator.js"
import { initKeyboard } from "./keyboard.js";

async function initializeApp() {
    const calculator = new Calculator(document.getElementById("calculator"));
    
    initKeyboard(calculator);
    // Wait for parser initialization if it's an async method
    await calculator.initializeParser();
    calculator.initialize();
    // console.log("now trying to init keyboard");
}

// Call the async initialization function
initializeApp();