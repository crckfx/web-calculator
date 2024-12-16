// keyboard.js
const keyMap = {
    '0': '0',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '.': '.',
    '+': '+',
    '-': '-',
    '*': '*',
    '/': '/',
    'Enter': '=', // You can map 'Enter' to '=' for evaluation
    '=': '=',     // Include '=' key if necessary
    'Backspace': 'Backspace',   // For deleting last character
    'Escape': 'Clear',          // For clearing the input
    // 'A': 'Answer',               // For re-inserting the last answer (aka 'ANS')
    // 'a': 'Answer',               // For re-inserting the last answer (aka 'ANS')
    '(': '(',
    ')': ')',
    ' ': ' ', // Space
    'ArrowLeft': 'ArrowLeft',
    'ArrowRight': 'ArrowRight',
    'Delete': 'Delete',
    '^': '^',
    'Home': 'Home',
    'End': 'End',
};

// Function to handle the keyboard input
export function initKeyboard(calculator) {
    // Event listener for keydown events
    document.addEventListener('keydown', function (event) {
        // Get the key value from the event
        const key = event.key;

        // Check if the key is in our mapping
        if (key in keyMap) {
            // // override default browser behavior for the key
            event.preventDefault();
            
            // Handle the key accordingly
            handleKeyInput(keyMap[key]);
        }
    });

    // Function to handle the key input and update the UI
    function handleKeyInput(input) {
        console.log(`KEYBOARD: '${input}'`);
        switch (input) {
            case 'Backspace':
                // Remove the character to the right of the cursor
                calculator.doBackspace();
                break;
            case 'Delete':
                // Remove the character to the left of the cursor
                calculator.doDelete();
                break;
            case 'Clear':
                // Clear the entire display
                calculator.AllClear();
                break;
            case '=':
                calculator.submit();
                break;
            // case 'Space':
            //     calculator.enterInputChar(' '); 
            //     break;
            case 'ArrowLeft':
                calculator.moveCursorLeft();
                break;
            case 'ArrowRight':
                calculator.moveCursorRight();
                break;
            case 'Home':
                calculator.moveCursorToStart();
                break;
            case 'End':
                calculator.moveCursorToEnd();
                break;
            default:
                // Append the input character to the display
                calculator.enterInputChar(input);
                break;
        }
    }
}