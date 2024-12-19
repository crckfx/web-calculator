# Web Calculator

## The webpage-based edition of Calculator.

### HTML/CSS 
Defines the GUI layout.

### JavaScript class '**Calculator**': 
- binds GUI buttons and keyboard inputs to its class methods
- uses class methods to call a parser

### Parser
Takes a string expression and returns an answer or an error. 

It comes in several forms:
- a **JavaScript class** which is to Calculator ('local/', 'module/')
- **C code compiled to WASM** ('wasm/')

It handles:
- Parentheses (including implicit multiplication)
- Exponentiation
- Multiplication & Division
- Addition & Subtraction