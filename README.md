# Regex WebTester

Regex WebTester is a tool to test and visualize regular expressions in real-time directly in your web browser.

## Features
- Input regular expressions and sample text
- Real-time feedback on regex matches
- Graph-based regex visualization  
  - Source: https://gitlab.com/javallone/regexper-static/
- Includes tasks that provide test cases for practice

## Installation
To install, clone the repository:
```
git clone https://github.com/Mr-Comand/regex-webtester.git
git submodule update --init --recursive
cd ./regexper-static
git apply --ignore-space-change --ignore-whitespace --reject < ../patches/submodule-changes.patch
```

Then, open the `index.html` in a browser to get started.

## Usage
1. Open the `index.html` file in any browser.
2. Input your regular expression and sample text to match.
3. See results highlighted in the sample text.

## Contributing
Feel free to fork the repository, open issues, and submit pull requests. Contributions are welcome!

## License
See [LICENSE.txt](/LICENSE) file for licensing details.
