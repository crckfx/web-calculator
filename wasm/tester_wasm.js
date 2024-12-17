// ----------------------------------------------------------------
// Tests for the parser that accept a calculator

function getMathsTests(calculator) {

    const mathsTests = [
        calculator.testInput("0.5 + 0.5", 1),     // test decimals
        calculator.testInput(".5 + .5", 1),
        calculator.testInput("2 * .25", 0.5),
        calculator.testInput("10 / .5", 20),
        calculator.testInput("10 / 0.5", 20),
        calculator.testInput("+8 + -3", 5),     // test operands    
        calculator.testInput("5 + -3 * 2", -1),
        calculator.testInput("10 / -2", -5),
        calculator.testInput("10 + +3", 13),
        calculator.testInput("-6 * -2", 12),
        calculator.testInput("9 / -8", -1.125),
        calculator.testInput("6(9)", 54),     // test implicit multiplication
        calculator.testInput("(5+1)(27/3)", 54),
        calculator.testInput("(9)6", 54),
        calculator.testInput("6+", NaN),     // test expected errors
        calculator.testInput("*6", NaN),
        calculator.testInput("5 + -", NaN),
        calculator.testInput("4 4", NaN),
    ];
    return mathsTests;
}

export function runMathsTests(calculator) {
    const tests = getMathsTests(calculator);
    let failed = false;
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        if (test.result === test.answer) {
            continue;
            // console.log(`successful test: "${test.expression}" = "${test.result}"`);
        } else {
            if (Number.isNaN(test.answer)) {
                continue;
            } else {
                console.warn(`failed test: "${test.expression}" with answer "${test.answer}" and result "${test.result}"`);
                failed = true;
                break;
            }
        }
    }
    // if not failed then print success
    if (!failed) {
        console.log("All maths tests succeeded.")
    }
}


