let taskData = {}
const regexInput = document.getElementById('regexInput');
const textInput = document.getElementById('textInput');
const highlightedText = document.getElementById('highlightedText');
const groupsOutput = document.getElementById('groupsOutput');
const testCasesContainer = document.getElementById('testCasesContainer');
const renderedRegexContainer = document.getElementById('renderedRegexContainer');
const renderedRegex = document.getElementById('renderedRegex');
const solutionButton = document.getElementById('solution');

function syncScroll(event) {
    if (event.target === textInput) {
        highlightedText.style.marginTop = -textInput.scrollTop + "px";
        highlightedText.style.marginLeft = -textInput.scrollLeft + "px";
    }
}

function highlightMatches() {
    const regexString = regexInput.value;
    const text = textInput.value;
    if (!regexString) {
        highlightedText.innerHTML = text;
        groupsOutput.innerHTML = '';
        return false;
    };
    try {
        const regex = new RegExp(regexString, 'g');
        const highlighted = text.replace(regex, match => `<span class="highlight">${match}</span>`);
        highlightedText.innerHTML = highlighted;

        // Extract and display capturing groups
        const matches = [...text.matchAll(regex)];
        groupsOutput.innerHTML = matches.map((match, index) => {
            const groups = match.slice(1).map((group, i) => `<span class="group"  onclick="jumpToGroup(${index}, ${i + 1})">Group ${i + 1}: ${group || 'N/A'}</span>`).join('<br>');
            return `<div><strong onclick="jumpToMatch(${index})">Match ${index + 1}: ${match[0]}</strong><br>${groups}</div>`;
        }).join('<hr>');
        return true;
    } catch (e) {
        highlightedText.innerHTML = text;
        groupsOutput.innerHTML = '<span style="color: red;" class="error">Invalid regex</span>';
        return false;
    }
}
function jumpToMatch(index) {
    const regexString = regexInput.value;
    const text = textInput.value;
    const regex = new RegExp(regexString, 'g');
    const matches = [...text.matchAll(regex)];
    if (matches[index]) {
        const match = matches[index];
        const start = match.index;
        const end = start + match[0].length;
        textInput.focus();
        textInput.setSelectionRange(start, end);
        textInput.scrollTop = textInput.scrollHeight * (start / text.length);
    }
}
function jumpToGroup(matchIndex, groupIndex) {
    const regexString = regexInput.value;
    const text = textInput.value;
    const regex = new RegExp(regexString, 'g');
    const matches = [...text.matchAll(regex)];
    if (matches[matchIndex] && matches[matchIndex][groupIndex]) {
        const match = matches[matchIndex];
        const group = match[groupIndex];
        const start = match.index + match[0].indexOf(group);
        const end = start + group.length;
        textInput.focus();
        textInput.setSelectionRange(start, end);
        textInput.scrollTop = textInput.scrollHeight * (start / text.length);
    }
}

function highlightTestCaseMatches(testCaseElement, regexString, text) {
    try {
        const regex = new RegExp(regexString, 'g');
        const highlighted = text.replace(regex, match => `<span class="highlight">${match}</span>`);
        testCaseElement.querySelector('pre').innerHTML = highlighted;
        return highlighted;
    } catch (e) {
        testCaseElement.querySelector('pre').innerHTML = text;
        return text;
    }
}

function checkSolution() {
    const userRegex = regexInput.value;
    testCasesContainer.innerHTML = '';
    let task = taskData;
    if (!task || !task.testcases) { return }

    let output = '';

    // Check if regex is the same
    if (userRegex === task.regex) {
        output += '<p style="color: green;">Regex is correct</p>';
    } else {
        output += '<p style="color: red;">Regex is incorrect</p>';
    }

    // Check each test case
    task.testcases.forEach((testcase, index) => {
        const userMatches = [...testcase.matchAll(new RegExp(userRegex, 'g'))];
        const expectedMatches = [...testcase.matchAll(new RegExp(task.regex, 'g'))];

        let testCaseResult = `<div class="testcase"><label>Test Case ${index + 1}:</label><pre>${testcase}</pre><button class="copy-btn">Copy to Text Input</button><div class="result">`;
        let allFine = true;
        let testCaseResults = "";

        if (userMatches.length === expectedMatches.length) {
            userMatches.forEach((userMatch, matchIndex) => {
                const expectedMatch = expectedMatches[matchIndex];
                if (userMatch[0] === expectedMatch[0]) {
                    testCaseResults += `<p style="color: green;">Match ${matchIndex + 1} is correct.</p>`;
                } else {
                    testCaseResults += `<p style="color: red;">Match ${matchIndex + 1} is ${userMatch[0]} and should be ${expectedMatch[0]}</p>`;
                    allFine = false;
                }

                // Check groups
                expectedMatch.slice(1).forEach((expectedGroup, groupIndex) => {
                    const userGroup = userMatch[groupIndex + 1];
                    if ((userGroup || 'N/A') === (expectedGroup || 'N/A')) {
                        testCaseResults += `<p style="color: green;">↳Group ${groupIndex + 1} is correct.</p>`;
                    } else {
                        testCaseResults += `<p style="color: red;">↳Group ${groupIndex + 1} is ${userGroup || 'N/A'} and should be ${expectedGroup}</p>`;
                        allFine = false;
                    }
                });
            });
        } else {
            testCaseResults += `<p style="color: red;">Number of matches is incorrect. Expected ${expectedMatches.length} but got ${userMatches.length}</p>`;
            allFine = false;
        }

        if (allFine) {
            testCaseResult += `<p style="color: green;" class="allfine">All matches are correct</p></div>`;
        } else {
            testCaseResult += testCaseResults;
        }
        testCaseResult += '</div></div>';
        output += testCaseResult;

        // Highlight matches in the test case
        const testCaseElement = document.createElement('div');
        testCaseElement.className = 'testcase';
        testCaseElement.innerHTML = testCaseResult;
        highlightTestCaseMatches(testCaseElement, userRegex, testcase);
        testCasesContainer.appendChild(testCaseElement);
    });

    // Add event listeners to copy buttons
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const preElement = event.target.previousElementSibling;
            textInput.value = preElement.textContent;
            highlightedText.textContent = preElement.textContent;
            highlightMatches();
        });
    });
}

function loadTask(taskFile) {
    fetch(`${taskFile}`)
        .then(response => response.json())
        .then(task => {
            taskData = task;
            // regexInput.value = ".*";
            if (task.text) {
                textInput.value = task.text;
                highlightedText.textContent = ''
            };
            if (task.textlink) {
                fetch(task.textlink)
                    .then(response => response.text())
                    .then(text => {
                        textInput.value = text;
                        highlightedText.textContent = text;
                        highlightMatches();
                    })
                    .catch(error => console.error('Error loading text from link:', error));
            };
            let valid = highlightMatches();
            if (valid) {
                // checkSolution();
                clearTimeout(renderTimeout);
                renderTimeout = setTimeout(renderRegex, 250);
            }

        })
        .catch(error => console.error('Error loading task:', error));
}

let renderTimeout;
let isRendering = false;
let renderedRegexContainerResetContent = renderedRegexContainer.innerHTML;
function renderRegex() {
    if (isRendering || !regexInput.value || regexInput.value==="" ) return;
    renderedRegexContainer.innerHTML = renderedRegexContainerResetContent;
    const progress = document.createElement('div');
    progress.className = 'progress';
    progress.innerHTML = '<div></div>';
    renderedRegexContainer.appendChild(progress);

    isRendering = true;

    const regexString = regexInput.value;
    const parser = new window.Parser(renderedRegexContainer, { keepContent: true });
    parser.parse(regexString).then(() => {
        parser.render();
        isRendering = false;
        console.log("rendered");
        renderedRegexContainer.style.display = '';
    }).catch((error) => {
        isRendering = false;
        throw error;
    });
}

regexInput.addEventListener('input', function () {
    let valid = highlightMatches();
    if (valid) {
        checkSolution();
        clearTimeout(renderTimeout);
        renderTimeout = setTimeout(renderRegex, 250);
    } else {
        renderedRegexContainer.style.display = 'none';
    }
});

textInput.addEventListener('input', () => {
    highlightedText.textContent = textInput.value;
    highlightMatches();
});

textInput.addEventListener('scroll', syncScroll);


solutionButton.addEventListener('click', () => {
    const regex = taskData.regex; // Get the regex value
    if (!regex) {
        alert('Keine Aufgabe geladen.');
        return;
    }
    // Copy to clipboard
    navigator.clipboard.writeText(regex)
        .then(() => {
            alert('Lösung kopiert.');
            console.log('Copied to clipboard:', regex);
        })
        .catch(err => {
            console.error('Error copying to clipboard:', err);
        });
});
