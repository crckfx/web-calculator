import { Parser } from "./Parser.js"

// calculator.js
export class Calculator {
    constructor(domObject) {
        // DOM elements
        this.calculator = domObject;
        this.parser = new Parser();
        // this.inputZone = this.calculator.querySelector("#inputArea");
        this.inputZone = this.calculator.querySelector("#inputZone");
        this.outputArea = this.calculator.querySelector("#outputArea");

        // Calculator state
        this.inputString = "";
        this.cursorPosition = 0;

        this.maxHistoryCount = 5;
        this.history = [];      // add history member var
        this.historyIndex = 0;

        // Bind UI elements to events
        this.initialize();
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

        // Prevent default typing behavior
        this.inputZone.addEventListener('keydown', (event) => {
            // this.handleKeyPress(event);
            event.preventDefault();
        });
        // Update cursor position when user clicks or navigates
        this.inputZone.addEventListener('click', () => this.updateCursorPositionFromDOM());
        this.inputZone.addEventListener('keyup', () => this.updateCursorPositionFromDOM());

        this.updateInputDisplay();
    }

    // --- UI functions ---
    updateInputDisplay() {
        if (this.inputString === "") {
            this.inputZone.innerHTML = '<span class="placeholder">\u200B</span>';
        } else {
            this.inputZone.innerHTML = this.inputString;
        }
        // this.inputZone.innerHTML = this.inputString;
        this.softSubmit();
        // Set the cursor position
        this.setCursorPosition(this.cursorPosition);
    }


    useDigitButton(value) {
        this.enterInputChar(value);
    }

    useOperandButton(value) {
        this.enterInputChar(value);
    }

    enterInputChar(char) {
        console.log(`INPUT: '${char}'`);

        // Insert the character at the cursor position
        this.inputString =
            this.inputString.slice(0, this.cursorPosition) +
            char +
            this.inputString.slice(this.cursorPosition);

        // Move the cursor position forward
        this.cursorPosition++;

        // Update the display
        this.updateInputDisplay();
    }

    enterInputString(string) {
        console.log(`INPUT STRING: '${string}'`);
        // Insert the character at the cursor position
        this.inputString =
            this.inputString.slice(0, this.cursorPosition) +
            string +
            this.inputString.slice(this.cursorPosition);

        // Move the cursor position forward
        this.cursorPosition += string.length; // expected to work; does not

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
        this.inputString = "";
        this.updateInputDisplay();
    }

    clearOutput() {
        this.outputArea.innerHTML = "";
    }

    doBackspace() {
        if (this.cursorPosition > 0) {
            this.inputString =
                this.inputString.slice(0, this.cursorPosition - 1) +
                this.inputString.slice(this.cursorPosition);
            this.cursorPosition--;
            this.updateInputDisplay();
        }
    }

    doDelete() {
        if (this.cursorPosition < this.inputString.length) {
            this.inputString =
                this.inputString.slice(0, this.cursorPosition) +
                this.inputString.slice(this.cursorPosition + 1);
            this.updateInputDisplay();
        }
    }


    submit() {
        if (this.inputString !== "") {

            const answer = this.parser.parse(this.inputString); // use parser
            this.outputArea.innerHTML = `${answer}`;

            if (typeof answer === "number") {
                // add a valid answer to history
                this.addToHistory(this.inputString, answer);
                this.printHistory();

                this.outputArea.classList.remove('soft');
            }
        }
    }

    softSubmit() {
        const answer = this.parser.parse(this.inputString); // use parser
        if (typeof answer === "number") {
            this.outputArea.classList.add('soft');
            this.outputArea.innerHTML = `${answer}`;
        } else {
            if (!this.outputArea.classList.contains('soft')) {
                this.outputArea.classList.add('soft');
            };
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
        const range = document.createRange();
        const selection = window.getSelection();

        // Ensure the position is within bounds
        position = Math.min(position, this.inputZone.textContent.length);
        position = Math.max(position, 0);

        // Set the range at the desired position
        range.setStart(this.inputZone.firstChild || this.inputZone, position);
        range.collapse(true);

        // Remove any existing selections and set the new range
        selection.removeAllRanges();
        selection.addRange(range);

        // Update the cursorPosition property
        this.cursorPosition = position;
    }

    moveCursorToStart() {
        this.cursorPosition = 0;
        this.updateInputDisplay();
    }
    moveCursorToEnd() {
        this.cursorPosition = this.inputString.length;
        this.updateInputDisplay();
    }

    moveCursorLeft() {
        if (this.cursorPosition > 0) {
            this.cursorPosition--;
            this.updateInputDisplay();
        } else {
            this.setCursorPosition(this.cursorPosition); // refocus even if no action to ensure cursor remains
        }
    }
    moveCursorRight() {
        if (this.cursorPosition < this.inputString.length) {
            this.cursorPosition++;
            this.updateInputDisplay();
        } else {
            this.setCursorPosition(this.cursorPosition); // refocus even if no action to ensure cursor remains
        }
    }

    updateCursorPositionFromDOM() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);

            // Ensure the selection is within inputArea
            if (this.inputZone.contains(range.startContainer)) {
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

        // for (let i = this.history.length - 1; i > -1; i--) {
        //     const hi = this.history[i];
        //     historyString += `\n${hi.str}:  `;
        //     historyString += `${hi.answer},`;

        // }

        console.log(historyString);
    }
    // ******************************************************************
}

