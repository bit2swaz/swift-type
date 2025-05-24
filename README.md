# SwiftType

A sleek, responsive, and performance-focused typing test application, heavily inspired by MonkeyType, and built entirely with **HTML, CSS, and Vanilla JavaScript**. SwiftType provides an engaging platform for users to improve their typing speed and accuracy, featuring a highly customizable experience.

## Live Demo
<!-- [Live Demo - Coming Soon!] *(You'll update this link once you deploy it!)* -->

---

## Features
- **Accurate WPM & Accuracy Tracking:** Real-time calculation and display of words per minute (WPM) and typing accuracy.
- **Raw WPM Calculation:** Provides insight into gross typing speed before error correction.
- **Detailed Results Breakdown:** After each test, view comprehensive stats including correct, incorrect, and extra characters typed.
- **Multiple Time Modes:** Choose from various test durations (e.g., 15s, 30s, 60s) to fit your practice needs.
- **Configurable Content:** Option to include numbers and punctuation in typing tests for varied practice.
- **Smooth Caret:** A precise, blinking caret indicates the current typing position, adapting seamlessly to text flow and word wrapping.
- **"Tab" Key Restart:** Quickly reset the test at any point, even mid-typing or from the results screen, for rapid iteration.
- **Responsive Design:** Ensures optimal usability and visual appeal across desktops, tablets, and mobile devices.
- **Dynamic Theme Toggle (Your Iconic Theme):** Seamlessly switch between a custom dark mode and a clean light mode, reflecting your unique design preferences.
- **Persistent Theme Preference:** User's selected theme is saved in local storage, providing a consistent experience across sessions.
- **Keyboard-Focused Interaction:** Primary interaction is through the keyboard, mirroring the efficiency of professional typing test applications.
- **Clean and Maintainable Codebase:** Structured HTML, well-organized CSS using custom properties for theming, and modular JavaScript for readability and extensibility.

---

## Tech Stack
- **HTML5:** For semantic structure and content.
- **CSS3:** For modern styling, responsiveness, and dynamic theme management using CSS Custom Properties (`:root`, `--var`, `var()`).
- **JavaScript (Vanilla):** For all interactive logic, DOM manipulation, test generation, and performance calculation.
- **Google Fonts:** For typography (`Roboto Mono`).
- **Font Awesome:** (Potentially for icons, if added in the future).

---

## What I Learned
- **Dynamic Text Generation & Rendering:** Efficiently creating and displaying large sets of words and individual characters, managing their states (correct, incorrect, current).
- **Precise Caret Positioning:** Implementing a custom, highly accurate blinking caret that tracks character and word position, including handling text wrapping across lines.
- **Real-time Performance Metrics:** Developing algorithms for calculating WPM and accuracy on the fly, as well as final detailed test results.
- **Advanced Event Handling (Keyboard Input):** Robustly managing `keydown` and `input` events for precise character processing, backspacing, and special key commands (like Tab for restart).
- **Responsive Layouts for Text Blocks:** Crafting a dynamic word display that gracefully handles word wrapping and scrolling to keep the current typing line in view.
- **User Preference Persistence:** Utilizing `localStorage` to save user settings (like test duration, content options, and theme choice) for a consistent and enhanced user experience.
- **Modular JavaScript Development:** Structuring the application logic into distinct functions for better organization and maintainability.
- **CSS Theming with Custom Properties:** Leveraging CSS custom properties for efficient and centralized management of light and dark mode styles.

---

## How to Run Locally
```bash
git clone YOUR_REPO_URL_HERE
cd SwiftType
open index.html
```

---

## Credits
Made with ❤️ by [bit2swaz](https://www.github.com/bit2swaz)

---

## What's Next
- Implement a basic calculation history feature.
- Add scientific functions (e.g., trigonometry, logarithms).
- Enhance error handling for more specific user feedback.
- Further optimize for touch interfaces.

---

## License
This project is open source and free to use.# swift-type