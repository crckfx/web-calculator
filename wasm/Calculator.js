import ParserModule from './build/parser2.js';

// calculator.js
export class Calculator {
    constructor(domObject) {
        // DOM elements
        this.calculator = domObject;

        this.inputArea = this.calculator.querySelector("#inputArea");
        this.outputArea = this.calculator.querySelector("#outputArea");

        // WASM Parser setup
        this.Parser = null;
        this.parserPtr = null;
        this.parser_parse = null;
        this.inputPtr = null;
        this.resultPtr = null;
        this.errorPtr = null;
        this.MAX_INPUT_LEN = 1024;

        // Calculator state
        // this.inputArea.value = "";
        this.cursorPosition = 0;

        this.maxHistoryCount = 5;
        this.history = [];      // add history member var
        this.historyIndex = 0;

    }



    parseExpression(expr) {
        if (!this.Parser || this.parserPtr === null) {
            console.error("Parser not initialized yet!");
            return NaN;
        }
        if (expr.length + 1 > this.MAX_INPUT_LEN) {
            console.error("Input too large for the pre-allocated buffer!");
            return NaN;
        }
        // Convert input to UTF-8 in WASM memory
        this.Parser.stringToUTF8(expr, this.inputPtr, this.MAX_INPUT_LEN);
        // Parse the expression
        const success = this.parser_parse(this.parserPtr, this.inputPtr, this.resultPtr, this.errorPtr);
        if (success) {
            const result = this.Parser.getValue(this.resultPtr, 'double');
            // console.log(`Result for "${expr}": ${result}`);
            return result;
        } else {
            const errorMessage = this.Parser.UTF8ToString(this.errorPtr);
            // console.error(`Error parsing "${expr}": ${errorMessage}`);
            return NaN;
        }
    }


    async initializeParser() {
        try {
            this.Parser = await ParserModule();

            // Create parser instance
            this.parserPtr = this.Parser.ccall('create_parser', 'number');

            // Wrap parser parse function
            this.parser_parse = this.Parser.cwrap('parser_parse', 'number', ['number', 'number', 'number', 'number']);

            // Allocate memory
            this.inputPtr = this.Parser._malloc(this.MAX_INPUT_LEN);
            this.resultPtr = this.Parser._malloc(8);
            this.errorPtr = this.Parser._malloc(256);

            console.log("WASM Parser initialized successfully");
        } catch (error) {
            console.error("Failed to initialize WASM Parser:", error);
        }
    }

    // --- Initialization ---
    initialize() {
        // Bind digit and operand buttons
        const digits = this.calculator.querySelectorAll("button.digit");
        for (let i = 0; i < digits.length; i++) {
            this.bindCharButton(digits[i]);
        }
        const operands = this.calculator.querySelectorAll("button.operand");
        for (let i = 0; i < operands.length; i++) {
            this.bindCharButton(operands[i]);
        }
        // Bind control buttons
        const controls = this.calculator.querySelectorAll("button.control");
        this.bindControlButtons(controls);

        // Update cursor position when user clicks or navigates
        // this.inputArea.addEventListener('click', () => this.updateCursorPositionFromDOM());        
        // this.inputArea.addEventListener('input', () => this.updateCursorPositionFromDOM());
        this.updateInputDisplay();
    }

    // --- UI functions ---
    updateInputDisplay() {
        // if (this.inputArea.value === "") {
        //     this.inputArea.innerHTML = '<span class="placeholder">\u200B</span>';
        // } else {
        //     this.inputArea.innerHTML = this.inputArea.value;
        // }
        // // this.inputArea.innerHTML = this.inputArea.value;
        this.softSubmit();
        // Set the cursor position
        // this.setCursorPosition(this.cursorPosition);
    }


    useDigitButton(value) {
        this.enterInput(value);
    }

    useOperandButton(value) {
        this.enterInput(value);
    }

    enterInputChar(char) {
        console.log(`INPUT: '${char}'`);
        this.inputArea.focus();

        const initialPos = this.inputArea.selectionStart;
        const newPos = initialPos + 1;

        // Insert the character at the cursor position
        const newValue = 
            this.inputArea.value.slice(0, initialPos) +
            char +
            this.inputArea.value.slice(initialPos);
        this.inputArea.value = newValue;
        // Move the cursor position forward
        this.cursorPosition++;
        this.inputArea.setSelectionRange(newPos, newPos);

        // Update the display
        this.updateInputDisplay();
    }

    enterInputString(string) {
        console.log(`INPUT STRING: '${string}'`);
        // Insert the character at the cursor position
        this.inputArea.value =
            this.inputArea.value.slice(0, this.inputArea.selectionStart) +
            string +
            this.inputArea.value.slice(this.inputArea.selectionStart);

        // Move the cursor position forward
        this.cursorPosition += string.length;
        this.inputArea.selectionStart += string.length;

        // Update the display
        this.updateInputDisplay();
    }

    // misc function to do both/either string/char
    enterInput(input) {
        //
        console.log(`INPUT (manual; misc): '${input}'`);
        this.inputArea.focus();

        const initialPos = this.inputArea.selectionStart;
        const newPos = initialPos + input.length;

        // Insert the character at the cursor position
        const newValue = 
            this.inputArea.value.slice(0, initialPos) +
            input +
            this.inputArea.value.slice(initialPos);
        this.inputArea.value = newValue;
        // Move the cursor position forward
        this.inputArea.setSelectionRange(newPos, newPos);

        // Update the display
        this.updateInputDisplay();
    }



    inputLastAnswer() {
        // use the history array, instead of a "lastAnswer" variable
        const lastIndex = (this.historyIndex - 1 + this.maxHistoryCount) % this.maxHistoryCount; // 
        const h = this.history[lastIndex]; // this nearly works but crashes at index 0
        if (h && typeof h.answer === "number") {
            // guaranteed to be a number here. cast to string so it can be concatenated properly
            this.enterInputString(h.answer.toString());
        }
    }

    // function to clear the input and the output
    AllClear() {
        this.clearInput();
        this.clearOutput();
    }

    clearInput() {
        this.inputArea.value = "";
        this.updateInputDisplay();
    }

    clearOutput() {
        this.outputArea.innerHTML = "";
    }

    doBackspace() {
        if (this.cursorPosition > 0) {
            this.inputArea.value =
                this.inputArea.value.slice(0, this.cursorPosition - 1) +
                this.inputArea.value.slice(this.cursorPosition);
            this.cursorPosition--;
            this.updateInputDisplay();
        }
    }

    doDelete() {
        if (this.cursorPosition < this.inputArea.value.length) {
            this.inputArea.value =
                this.inputArea.value.slice(0, this.cursorPosition) +
                this.inputArea.value.slice(this.cursorPosition + 1);
            this.updateInputDisplay();
        }
    }


    submit() {
        if (this.inputArea.value !== "") {

            const answer = this.parseExpression(this.inputArea.value); // NOTE 2. THIS SHOULD USE THE DEFINED METHOD NOT A CLASS
            this.outputArea.innerHTML = `${answer}`;

            if (!isNaN(answer)) {
                // add a valid answer to history
                this.addToHistory(this.inputArea.value, answer);
                this.printHistory();

                this.outputArea.classList.remove('soft');
            }
        }
    }

    softSubmit() {
        const answer = this.parseExpression(this.inputArea.value);
        if (!isNaN(answer)) {
            this.outputArea.classList.add('soft');
            this.outputArea.innerHTML = `${answer}`;
        } else {
            if (!this.outputArea.classList.contains('soft')) {
                this.outputArea.classList.add('soft');
            }
        }
    }



    // --- UI binding ---
    bindCharButton(button) {
        const value = button.value;
        if (button.classList.contains("digit")) {
            // console.log(`binding target: ${button.value} as a digit`);
            button.addEventListener('click', () => this.useDigitButton(value));
        } else if (button.classList.contains("operand")) {
            // console.log(`binding target: ${button.value} as an operand`);
            button.addEventListener('click', () => this.useOperandButton(value));
        } else {
            console.error(`tried to bind button of unknown type: '${value}'`);
        }
    }

    bindControlButtons(controls) {
        for (let i = 0; i < controls.length; i++) {
            const button = controls[i];
            const value = button.value;

            switch (value) {
                case 'DELETE':
                    button.addEventListener('click', () => this.doBackspace());
                    break;
                case 'CLEAR':
                    button.addEventListener('click', () => this.AllClear());
                    break;
                case '=':
                    button.addEventListener('click', () => this.submit());
                    break;
                case 'ANS':
                    // button.addEventListener('click', () => this.inputLastAnswer());
                    button.addEventListener('click', () => this.inputLastAnswer());
                    break;
                case 'ARROWLEFT':
                    button.addEventListener('click', () => this.moveCursorLeft());
                    break;
                case 'ARROWRIGHT':
                    button.addEventListener('click', () => this.moveCursorRight());
                    break;
                default:
                    console.log(`UNMANAGED CONTROL VALUE ${value}`);
                    break;
            }

        }
    }

    // ******************************************************************
    // *** CURSOR **********************

    setCursorPosition(position) {
        // Ensure the position is within bounds
        position = Math.min(Math.max(position, 0), this.inputArea.value.length);
        // this.cursorPosition = position;

        // Use standard input element cursor positioning
        this.inputArea.focus();
        this.inputArea.setSelectionRange(position, position);
    }

    moveCursorToStart() {
        this.cursorPosition = 0;
        this.updateInputDisplay();
    }
    moveCursorToEnd() {
        this.cursorPosition = this.inputArea.value.length;
        this.updateInputDisplay();
    }

    moveCursorLeft() {
        this.inputArea.focus();
        if (this.inputArea.selectionStart > 0) {
            const pos = this.inputArea.selectionStart - 1;
            this.inputArea.setSelectionRange(pos, pos);
            // this.inputArea.selectionStart--;
            this.updateInputDisplay();
        } else {

            // this.setCursorPosition(this.inputArea.selectionStart); // refocus even if no action to ensure cursor remains
        }
    }
    moveCursorRight() {
        this.inputArea.focus();
        if (this.inputArea.selectionStart < this.inputArea.value.length) {
            const pos = this.inputArea.selectionStart + 1;
            this.inputArea.setSelectionRange(pos, pos);
            this.updateInputDisplay();
        } else {
            // this.setCursorPosition(this.inputArea.selectionStart); // refocus even if no action to ensure cursor remains
        }
    }

    updateCursorPositionFromDOM() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);

            // Ensure the selection is within inputArea
            if (this.inputArea.contains(range.startContainer)) {
                // Update cursorPosition
                this.cursorPosition = range.startOffset;
            }
        }
    }
    // ******************************************************************

    // ******************************************************************
    // *** HISTORY **********************    

    addToHistory(inputString, answer) {
        if (this.history.length < this.maxHistoryCount) {
            this.history.push({ str: inputString, answer: answer });
        } else {
            // Overwrite oldest entry when full
            this.history[this.historyIndex] = { str: inputString, answer: answer };
        }
        // Update current index to the next position (circular behavior)
        this.historyIndex = (this.historyIndex + 1) % this.maxHistoryCount;
    }

    printHistory() {
        // set a variable for the string
        let historyString = "historyString: ";
        let length = this.history.length;

        // Start from the most recent and iterate backwards
        for (let i = 0; i < length; i++) {
            // Compute the current index manually
            const index = (this.historyIndex - 1 - i + this.maxHistoryCount) % this.maxHistoryCount;
            const hi = this.history[index];
            historyString += `\n${hi.str} = ${hi.answer},`;
        }

        console.log(historyString);
    }
    // ******************************************************************
    cleanup() {
        if (this.Parser && this.parserPtr) {
            // Destroy parser
            this.Parser.ccall('destroy_parser', null, ['number'], [this.parserPtr]);

            // Free allocated memory
            this.Parser._free(this.inputPtr);
            this.Parser._free(this.resultPtr);
            this.Parser._free(this.errorPtr);

            console.log("WASM Parser resources cleaned up");
        }
    }

    testInput(expression, answer) {
        return {
            expression: expression,
            answer: answer,
            result: this.parseExpression(expression)
        }
    }

}

