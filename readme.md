# Web Calculator

### This is the webpage-based edition of Calculator.

The HTML defines the GUI layout.

The JavaScript class '**Calculator**': 
- binds GUI buttons and keyboard inputs to its class methods
- uses class methods to call a parser

The **Parser** comes in several forms:
- a **JavaScript class** which is to Calculator ('local/', 'module/')
- **C code compiled to WASM** ('wasm/')

It handles:
- Parentheses (including implicit multiplication)
- Exponentiation
- Multiplication & Division
- Addition & Subtraction