
let taskData = {}
const regexInput = document.getElementById('regexInput');
const textInput = document.getElementById('textInput');
const highlightedText = document.getElementById('highlightedText');
const groupsOutput = document.getElementById('groupsOutput');
const testCasesContainer = document.getElementById('testCasesContainer');
const renderedRegexContainer = document.getElementById('renderedRegexContainer');
const renderedRegex = document.getElementById('renderedRegex');

function syncScroll(event) {
    if (event.target === textInput) {
        highlightedText.style.marginTop = -textInput.scrollTop + "px";
        highlightedText.style.marginLeft = -textInput.scrollLeft + "px";
    }
}

function highlightMatches() {
    const regexString = regexInput.value;
    const text = textInput.value;

    try {
        const regex = new RegExp(regexString, 'g');
        const highlighted = text.replace(regex, match => `<span class="highlight">${match}</span>`);
        highlightedText.innerHTML = highlighted;

        // Extract and display capturing groups
        const matches = [...text.matchAll(regex)];
        groupsOutput.innerHTML = matches.map((match, index) => {
            const groups = match.slice(1).map((group, i) => `<span class="group">Group ${i + 1}: ${group || 'N/A'}</span>`).join('<br>');
            return `<div><strong>Match ${index + 1}: ${match[0]}</strong><br>${groups}</div>`;
        }).join('<hr>');
        return true;
    } catch (e) {
        highlightedText.innerHTML = text;
        groupsOutput.innerHTML = '<span style="color: red;">Invalid regex</span>';
        return false;
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
    let task = taskData
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
        const userMatches = [...testcase.input.matchAll(new RegExp(userRegex, 'g'))];
        const expectedMatches = testcase.output;

        let testCaseResult = `<div class="testcase"><label>Test Case ${index + 1}:</label><pre>${testcase.input}</pre><div class="result">`;
        let allFine = true;
        let testCaseResults = "";
        expectedMatches.forEach((expectedMatch, matchIndex) => {
            const userMatch = userMatches[matchIndex];
            if (userMatch && userMatch[0] === expectedMatch.match) {
                testCaseResults += `<p style="color: green;">Match ${matchIndex + 1} is correct.</p>`;
            } else {
                testCaseResults += `<p style="color: red;">Match ${matchIndex + 1} is ${userMatch|| 'N/A'} and should be ${expectedMatch.match}</p>`;
                allFine = false;
            }

            // Check groups
            expectedMatch.Groups.forEach((expectedGroup, groupIndex) => {
                const userGroup = userMatch ? userMatch[groupIndex + 1] : undefined;
                if ((userGroup || 'N/A') === expectedGroup) {
                    testCaseResults += `<p style="color: green;">↳Group ${groupIndex + 1} is correct.</p>`;
                } else {
                    testCaseResults += `<p style="color: red;">↳Group ${groupIndex + 1} is ${userGroup || 'N/A'} and should be ${expectedGroup}</p>`;
                    allFine = false;
                }
            });
        });
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
        highlightTestCaseMatches(testCaseElement, userRegex, testcase.input);
        testCasesContainer.appendChild(testCaseElement);
    });



}

function loadTask(taskFile) {
    fetch(`tasks/${taskFile}`)
        .then(response => response.json())
        .then(task => {
            taskData = task;
            regexInput.value = task.regex;
            textInput.value = '';
            highlightedText.textContent = '';
            let valid = highlightMatches();
            if (valid) {
                checkSolution();
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
    if (isRendering) return;
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