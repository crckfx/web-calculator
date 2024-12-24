// calculator.js
class Calculator {
    constructor(domObject) {
        // DOM elements
        this.calculator = domObject;

        this.inputArea = this.calculator.querySelector("#inputArea");
        this.allowedCharacters = /^[0-9+\-*/.()^]*$/;
        this.outputArea = this.calculator.querySelector("#outputArea");

        this.parser = new Parser();

        // Calculator state
        this.cursorPosition = 0;
        this.maxHistoryCount = 5;
        this.history = [];      // add history member var
        this.historyIndex = 0;

        this.lastInput = null;
    }


    initialize() {
        // do not need to await a parser here because we instantiated it in javascript (vs. WASM)

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

        this.inputArea.addEventListener('input', () => {
            this.validateInput();
        })
        this.inputArea.addEventListener('keydown', (e) => {
            switch (e.key) {
                case '=':
                case 'Enter':
                    this.submit();
                    break;
                case 'Escape':
                    this.AllClear();
                    break;
            }            
        });
        this.outputArea.addEventListener('click', () => {
            // console.log(`you want to use an old answer hey, possibly '${this.lastInput}'`);
            this.outputArea.innerHTML = "";
            this.inputArea.value = this.lastInput;
            this.inputArea.focus();
        });

        this.updateInputDisplay();
    }


    validateInput() {
        const value = this.inputArea.value;
        if (!this.allowedCharacters.test(value)) {
            this.inputArea.value = value.replace(/[^0-9+\-*/.()]/g, '');
        }
    }    

    // parseExpression(expr) {
    //     if (!this.Parser || this.parserPtr === null) {
    //         console.error("Parser not initialized yet!");
    //         return NaN;
    //     }
    //     if (expr.length + 1 > this.MAX_INPUT_LEN) {
    //         console.error("Input too large for the pre-allocated buffer!");
    //         return NaN;
    //     }
    //     // Convert input to UTF-8 in WASM memory
    //     this.Parser.stringToUTF8(expr, this.inputPtr, this.MAX_INPUT_LEN);
    //     // Parse the expression
    //     const success = this.parser_parse(this.parserPtr, this.inputPtr, this.resultPtr, this.errorPtr);
    //     if (success) {
    //         const result = this.Parser.getValue(this.resultPtr, 'double');
    //         // console.log(`Result for "${expr}": ${result}`);
    //         return result;
    //     } else {
    //         const errorMessage = this.Parser.UTF8ToString(this.errorPtr);
    //         // console.error(`Error parsing "${expr}": ${errorMessage}`);
    //         return NaN;
    //     }
    // }


    // --- UI functions ---
    updateInputDisplay() {
        this.inputArea.focus();
        // this.softSubmit();
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
            this.enterInput(h.answer.toString());
        }
    }

    // function to clear the input and the output
    AllClear() {
        this.clearInput();
        this.clearOutput();
        this.updateInputDisplay();
    }

    clearInput() {
        this.inputArea.value = "";   
    }

    clearOutput() {
        this.outputArea.innerHTML = "";
    }

    doBackspace() {
        this.inputArea.focus();
        const pos = this.inputArea.selectionStart;
        if (pos > 0) {
            const newPos = pos - 1;
            const newInput =
                this.inputArea.value.slice(0, newPos) +
                this.inputArea.value.slice(pos);
            this.inputArea.value = newInput;
            this.inputArea.setSelectionRange(newPos, newPos);

            this.updateInputDisplay();
        }
    }

    submit() {
        // this.inputArea.focus();
        // get the string and save it
        const inputString = this.inputArea.value;
        if (inputString !== "") {
            const answer = this.parser.parse(inputString);   // NOTE 2. THIS SHOULD USE THE DEFINED METHOD NOT A CLASS
            // this.outputArea.innerHTML = `${answer}`;
            this.outputArea.innerHTML = `${inputString} = ${answer}`;
            
            if (!isNaN(answer)) {
                this.inputArea.value = `${answer}`;
                this.lastInput = inputString // save the input as last
                this.addToHistory(inputString, answer);         // add a valid answer to history
                this.printHistory();                            // display the history
                // this.outputArea.classList.remove('soft');       // make visuals 'real' (not 'soft')
                this.moveCursorToEnd();
                this.outputArea.focus();
                
            }
        }
    }

    softSubmit() {
        this.inputArea.focus();
        const answer = this.parser.parse(this.inputArea.value);
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
            button.addEventListener('click', () => this.enterInput(value));
        } else if (button.classList.contains("operand")) {
            button.addEventListener('click', () => this.enterInput(value));
        } else {
            console.error(`tried to bind button of unknown type: '${value}'`);
        }
    }

    bindControlButtons(controls) {
        for (let i = 0; i < controls.length; i++) {
            const button = controls[i];
            const value = button.value;
            // bind custom string codes for UI buttons
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
                    button.addEventListener('click', () => this.moveCursor(-1));
                    break;
                case 'ARROWRIGHT':
                    button.addEventListener('click', () => this.moveCursor(1));
                    break;
                default:
                    console.log(`UNMANAGED CONTROL VALUE ${value}`);
                    break;
            }
        }
    }

    // ******************************************************************
    // *** CURSOR **********************

    moveCursorToStart() {
        // this.inputArea.focus();
        this.inputArea.setSelectionRange(0, 0);
        this.updateInputDisplay();
    }
    moveCursorToEnd() {
        const endPos = this.inputArea.value.length;
        // this.inputArea.focus();
        this.inputArea.setSelectionRange(endPos, endPos);
        this.updateInputDisplay();
    }

    moveCursor(steps) {
        const currentPos = this.inputArea.selectionStart;
        const newPos = currentPos + steps;
        console.log(`moveCursor: moving '${steps}' steps`);
        
        if (steps > 0) {
            if (this.inputArea.selectionStart < this.inputArea.value.length) {
                this.inputArea.setSelectionRange(newPos, newPos);
                this.updateInputDisplay();
            }
        }
        else if (steps < 0) {
            if (this.inputArea.selectionStart > 0) {
                this.inputArea.setSelectionRange(newPos, newPos);
                this.updateInputDisplay();
            }            
        } else {
            // nothing
        }
        this.inputArea.focus();
    }    
    // ******************************************************************
 
    // ******************************************************************
    // ******** HISTORY *****************    
    //
    // append the history
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
    //
    // output the history
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
    // ********** MISC ******************
    //
    // ** FOR TIDYING UP THE WASM/C **
    // cleanup() {
    //     if (this.Parser && this.parserPtr) {
    //         // Destroy parser
    //         this.Parser.ccall('destroy_parser', null, ['number'], [this.parserPtr]);

    //         // Free allocated memory
    //         this.Parser._free(this.inputPtr);
    //         this.Parser._free(this.resultPtr);
    //         this.Parser._free(this.errorPtr);

    //         console.log("WASM Parser resources cleaned up");
    //     }
    // }
    //
    // ** FOR TESTER **
    testInput(expression, answer) {
        return {
            expression: expression,
            answer: answer,
            result: this.parser.parse(expression)
        }
    }
    // ******************************************************************

}

