export class Parser {
    constructor() {
        this.tokens = [];
        this.position = 0;
    }

    static tokenize(input) {
        const tokens = [];
        const regex = /\s*([+\-*/()^]|\d+(\.\d*)?|\.\d+)\s*/g; // Add ^ to regex
        let match;
        while ((match = regex.exec(input)) !== null) {
            tokens.push(match[1]);
        }
        return tokens;
    }


    // highest-level function - tokenizes, makes sure it's valid, then uses parseExpression()
    parse(inputString) {
        this.tokens = Parser.tokenize(inputString); // Tokenize the input string
        this.position = 0; // Reset the position tracker

        if (!this.tokens || this.tokens.length === 0) { // Check if there are tokens
            return "ERROR"; // No tokens -> Invalid input
        }

        const result = this.parseExpression(); // Delegate to parseExpression for actual evaluation
        if (result === "ERROR" || this.position !== this.tokens.length) {
            return "ERROR"; // Parsing failed or leftover unprocessed tokens -> Invalid input
        }
        return result; // Return the final result
    }

    // handle addition/subtraction
    parseExpression() {
        let value = this.parseTerm(); // Get the first term
        if (value === "ERROR") return "ERROR"; // Check for errors

        while (this.position < this.tokens.length) { // Process all tokens
            const operator = this.tokens[this.position]; // Check the current operator
            if (operator === '+' || operator === '-') {
                this.position++; // Move past the operator
                const right = this.parseTerm(); // Parse the next term
                if (right === "ERROR") return "ERROR"; // Error in parsing the term
                value = operator === '+' ? value + right : value - right; // Update the result
            } else {
                break; // No more addition/subtraction -> Exit loop
            }
        }
        return value; // Return the final result
    }

    // handle multiplication/division
    parseTerm() {
        let value = this.parseFactor(); // Get the first factor
        if (value === "ERROR") return "ERROR"; // Check for errors

        while (this.position < this.tokens.length) { // Process all tokens
            const operator = this.tokens[this.position]; // Check the current operator
            if (operator === '*' || operator === '/') {
                this.position++; // Move past the operator
                const right = this.parseFactor(); // Parse the next factor
                if (right === "ERROR" || (operator === '/' && right === 0)) return "ERROR"; // Handle errors
                value = operator === '*' ? value * right : value / right; // Update the result
            } else {
                break; // No more multiplication/division -> Exit loop
            }
        }
        return value; // Return the final result
    }

    // handle exponentiation and parentheses
    parseFactor() {
        // if we have run out of tokens, it's an error
        if (this.position >= this.tokens.length) return "ERROR"; // error check

        let value; // Initialize the value to hold the result of this factor.
        let token = this.tokens[this.position]; // Get the current token.

        // Handle unary '+' or '-' operators, e.g., +5 or -3.
        if (token === '+' || token === '-') {
            this.position++; // Move past the unary operator.
            const factor = this.parseFactor(); // Parse the next factor (recursively).
            if (factor === "ERROR") return "ERROR"; // If parsing fails, propagate the error.
            return token === '+' ? factor : -factor; // Apply the unary operator to the factor.
        }

        // Handle expressions enclosed in parentheses, e.g., (3 + 4).
        else if (token === '(') {
            this.position++; // Move past the opening parenthesis.
            value = this.parseExpression(); // Parse the inner expression.
            if (value === "ERROR" || this.tokens[this.position] !== ')') {
                return "ERROR"; // If there's an error or no closing parenthesis, return an error.
            }
            this.position++; // Move past the closing parenthesis.

            // Check for implicit multiplication after the closing parenthesis.
            if (this.position < this.tokens.length) {
                const nextToken = this.tokens[this.position];
                // If the next token is another parenthesis or a number, apply implicit multiplication.
                if (
                    nextToken === '(' ||
                    /^\d+(\.\d*)?$/.test(nextToken) ||
                    /^\.\d+$/.test(nextToken)
                ) {
                    const nextFactor = this.parseFactor(); // Parse the implicit multiplication.
                    if (nextFactor === "ERROR") return "ERROR";
                    value *= nextFactor; // Multiply the parsed value with the next factor.
                }
            }
        }

        // Handle numeric tokens, e.g., 42 or 3.14.
        else if (/^\d+(\.\d*)?$/.test(token) || /^\.\d+$/.test(token)) {
            this.position++; // Move past the number token.
            value = parseFloat(token); // Convert the token into a float.

            // Check for implicit multiplication after a number.
            if (this.position < this.tokens.length) {
                const nextToken = this.tokens[this.position];
                // If the next token is a parenthesis, apply implicit multiplication.
                if (nextToken === '(') {
                    const nextFactor = this.parseFactor(); // Parse the implicit multiplication.
                    if (nextFactor === "ERROR") return "ERROR";
                    value *= nextFactor; // Multiply the parsed value with the next factor.
                }
            }
        }

        // If the token doesn't match any valid pattern, return an error.
        else {
            return "ERROR";
        }

        // Handle exponentiation, e.g., 2^3.
        if (this.position < this.tokens.length && this.tokens[this.position] === '^') {
            this.position++; // Move past the '^' operator.
            const exponent = this.parseFactor(); // Parse the exponent (recursively).
            if (exponent === "ERROR") return "ERROR"; // If parsing fails, propagate the error.
            value = Math.pow(value, exponent); // Apply the power operation.
        }

        // Return the final value of this factor.
        return value;
    }

}
