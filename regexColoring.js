const input = document.querySelector('.regexColoring-input');
const highlight = document.querySelector('.regexColoring-highlight');

// Function to highlight matching brackets, stars, and escaped characters
function highlightBrackets(text) {
    const stack = [];
    const result = Array.from(text); // Convert text to array for manipulation
    const pairs = { '(': ')' };
    const classes = { '(': 'round', ')': 'round' };
    let pairIndex = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (pairs[char]) {
            // Open bracket
            stack.push({ char, index: i, pairIndex });
            pairIndex++;
        } else if (Object.values(pairs).includes(char)) {
            // Close bracket
            const last = stack.pop();
            if (last && pairs[last.char] === char) {
                // Highlight matching pairs
                const pairClass = `pair${last.pairIndex % 10 + 1}`; // Cycle through set1, set2, set3
                result[last.index] = `<span class="match ${classes[last.char]} ${pairClass}">${last.char}</span>`;
                result[i] = `<span class="match ${classes[char]} ${pairClass}">${char}</span>`;
            } else {
                // Unmatched closing bracket
                result[i] = `<span class="error">${char}</span>`;
            }
        } else if (char === '\\') {
            // Highlight escape sequences
            const nextChar = text[i + 1] || '';
            if (nextChar === '') {
                result[i] = `<span class="error">${char}</span>`;
            } else {
                result[i] = `<span class="escaped">${char}</span>`;
                if (nextChar) {
                    result[i + 1] = `<span class="escaped">${nextChar}</span>`;
                    i++; // Skip the next character since it's part of the escape
                }
            }
        } else if (char === '+' || char === '?' || char === '*') {
            result[i] = `<span class="quantifier">${char}</span>`;
        } else if (char === '{') {
            const closingIndex = text.indexOf('}', i);
            if (closingIndex !== -1) {
                const quantifier = text.slice(i, closingIndex + 1);
                const match = /^\{([0-9]+)(?:,([0-9]*))?\}$/.exec(quantifier);

                if (match) {
                    const group1 = parseInt(match[1], 10);
                    const group2 = match[2] ? parseInt(match[2], 10) : undefined;

                    if (group2 !== undefined && group1 > group2) {
                        // Error case: group1 > group2
                        result[i] = `<span class="error">${quantifier}</span>`;
                    } else {
                        // Valid quantifier
                        result[i] = `<span class="quantifier">${quantifier}</span>`;
                    }

                    // Clear the rest of the quantifier characters
                    for (let j = i + 1; j < closingIndex + 1; j++) {
                        result[j] = ''; // Remove the quantifier from the result
                    }

                    i = closingIndex; // Skip to the closing curly brace
                }
            }
        } else if (char === '^' || char === '$') {
            if (char === '^' && i !== 0 && text[i - 1] === '[') {
                result[i] = `<span class="match pair${(pairIndex - 1) % 10 + 1}">${char}</span>`;
            } else {
                result[i] = `<span class="anchor">${char}</span>`;
            }
        } else if (char === '|') {
            result[i] = `<span class="alternation">${char}</span>`;
        }
        else if (char === '.') {
            result[i] = `<span class="any">${char}</span>`;

        } else if (char === '[') {
            let closingIndex = text.indexOf(']', i);
            exit = false;
            if (closingIndex !== -1) {
                let anyOf = text.slice(i + 1, closingIndex);
                // Loop to check for an uneven number of backslashes at the end
                while (anyOf.endsWith('\\')) {
                    // Count the number of consecutive backslashes at the end of the string
                    let backslashCount = 0;
                    for (let j = anyOf.length - 1; j >= 0; j--) {
                        if (anyOf[j] === '\\') {
                            backslashCount++;
                        } else {
                            break;
                        }
                    }

                    // If the backslash count is odd, continue looking for the next ']'
                    if (backslashCount % 2 !== 0) {
                        closingIndex = text.indexOf(']', closingIndex + 1);
                        if (closingIndex === -1) {
                            result[i] = `<span class="error">${char}</span>`;
                            exit = true;
                            break; // Prevent infinite loop in case no closing bracket is found
                        }
                        anyOf = text.slice(i + 1, closingIndex); // Update the content inside the brackets
                    } else {
                        break; // Stop the loop if the backslash count is even
                    }
                }
                if (!exit) {

                    if (anyOf.startsWith('^')) {
                        result[i] = `<span class="anyOf">[^</span>`;
                        result[i + 1] = ``;
                        anyOf = text.slice(i + 2, closingIndex);
                        i++;
                    } else {
                        result[i] = `<span class="anyOf">[</span>`;

                    }

                    for (let j = i + 1; j < closingIndex; j++) {
                        if (result[j] === '\\') {
                            // If the character is a backslash, add it to the result
                            result[j] = `<span class="escaped">${result[j]}</span>`;
                            result[j + 1] = `<span class="escaped">${result[j + 1]}</span>`;
                            j++; // Skip the next character since it's part of the escape
                        }

                    }
                    result[closingIndex] = `<span class="anyOf">]</span>`;

                    // // Clear the rest of the quantifier characters
                    // for (let j = i + 2; j < closingIndex + 1; j++) {
                    //     result[j] = ''; // Remove the quantifier from the result
                    // }

                    i = closingIndex; // Skip to the closing curly brace

                }
            } else {
                result[i] = `<span class="error">${char}</span>`;
            }
        }


    }

    // Highlight unmatched opening brackets
    stack.forEach(({ index }) => {
        result[index] = `<span class="error">${text[index]}</span>`;
    });

    return result.join('').replace(/\n/g, '<br>'); // Convert array back to string
}

input.addEventListener('input', () => {
    const rawText = input.value;
    highlight.innerHTML = highlightBrackets(rawText);
});

const originalValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
Object.defineProperty(input, 'value', {
    get: originalValue.get,
    set(newValue) {
        originalValue.set.call(this, newValue);
        const event = new Event('input', { bubbles: true });
        this.dispatchEvent(event); // Trigger an input event
    }
});

window.addEventListener('load', () => {
    const rawText = input.value;
    highlight.innerHTML = highlightBrackets(rawText);
});
