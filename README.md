# ARCHIVA — Academic Ledger

ARCHIVA is a browser-based academic record tool that helps students track their semester grades and calculate their GPA and CGPA. It provides subject management, academic reporting, PDF generation, and sharing in one place.

**Live application:** https://neokritus.github.io/ARCHIVA/

---

## Overview

ARCHIVA provides a structured way to record academic details without relying on manual calculations or scattered spreadsheets.

Students can:

- Enter their student details.
- Select one or more semester sheets in any order.
- Enter grades for every subject.
- Customize subjects when the standard subject list needs to be changed.
- Calculate semester GPA and overall CGPA.
- Track arrear grades separately.
- Review a complete subject-wise academic report.
- Download academic results as PDF files.
- Share results using the available sharing options.
- Recover an unfinished academic record from the same browser session.

The current version is configured for **Electronics and Communication Engineering (ECE)** under **Anna University's Regulation 2023 (R2023)**.

---

## Features

### Academic Record Management

- **Semester-wise grade entry** — Select any combination of semesters and enter grades subject by subject.
- **Subject customization** — Use the **EDIT** option to add, edit, or remove subjects and update their code, name, or credits.
- **Semester GPA calculation** — Calculates the GPA for each selected semester from the entered grades and credits.
- **CGPA calculation** — Calculates the cumulative CGPA across the selected semesters using the configured grading logic.
- **Arrear tracking** — Grades such as U, RA, SA, and W are identified as arrears and listed separately in the academic report.
- **Grade validation** — Prevents calculation until required student details, semester selections, and subject grades are completed.

### Reports & Output

- **Sealed CGPA result** — Presents the calculated CGPA in the ARCHIVA result seal.
- **Complete Academic Report** — Provides student information, semester-wise subject details, GPA, cumulative CGPA, and arrear details.
- **Academic Result PDF** — Generates a concise result PDF.
- **Complete Academic Report PDF** — Generates a detailed academic report PDF.
- **PDF preview** — Allows generated reports to be previewed within the application before downloading.
- **Share options** — Copy the result summary, share PDF reports, or use the browser/device sharing option where supported.

### User Experience

- **Session recovery** — Saves the in-progress academic record locally so it can be restored in the same browser.
- **Light and dark themes** — Switch between themes while retaining the selected preference.
- **Reset Ledger** — Clears entered details, selections, grades, and customized session data after confirmation.
- **Responsive interface** — Designed for both desktop and smaller-screen layouts.
- **Client-side processing** — Academic calculations and record handling are performed in the browser; student academic data is not submitted to an application server.

---

## How It Works

1. Enter the **student name** and **roll number**.
2. Select one or more **semester sheets**.
3. If required, use **EDIT** to add, edit, or remove subjects or update their **code, name, or credits**.
4. Mark the **grade** for every subject in the subject sheet.
5. Select **Calculate & Seal**.
6. ARCHIVA calculates the semester GPA and overall CGPA and displays the sealed result.
7. Select **View Complete Academic Report** for the complete subject-wise breakdown.
8. Use **Download** to save an academic result or complete report as PDF, or use **Share** for the available sharing options.

If required information is missing or invalid, ARCHIVA highlights the relevant field or displays a validation message before calculation can be completed.

---

## Grading & Calculation

ARCHIVA uses the configured Anna University grading structure for the current R2023 ECE implementation.

| Grade | Grade Point |
|:-----:|------------:|
| O | 10 |
| A+ | 9 |
| A | 8 |
| B+ | 7 |
| B | 6 |
| C | 5 |
| U | 0 |
| RA | 0 |
| SA | 0 |
| W | 0 |

For GPA/CGPA calculation, regular grades contribute their corresponding grade points multiplied by the subject credits. Arrear grades are identified separately and are not included in the credit-point accumulation used by the current calculation logic.

The general calculation is:

**GPA = Σ(Credit × Grade Point) / Σ(Credits)**

**CGPA = Total Credit Points / Total Credits**

The exact result depends on the subjects, credits, grades, and semesters entered by the user.

---

## Tech Stack

ARCHIVA is implemented as a lightweight static web application without a backend or application framework.

- **HTML5** — Application structure and semantic markup
- **CSS3** — Layout, responsive design, themes, modals, tables, and visual styling
- **Vanilla JavaScript** — Application state, validation, subject management, calculations, persistence, reporting, and interaction logic
- **jsPDF 2.5.1** — PDF document generation
- **jsPDF-AutoTable 3.8.2** — Structured tables inside generated PDFs
- **PDF.js 3.11.174** — In-browser PDF rendering/preview
- **html2canvas 1.4.1** — Capturing the ARCHIVA result seal for PDF output
- **Browser Local Storage** — Local session persistence and recovery
- **Web Share / Clipboard APIs** — Result sharing and copy functionality where supported by the browser/device

The application uses CDN-hosted versions of the PDF-related libraries and otherwise runs as static HTML, CSS, and JavaScript.

---

## Project Structure

```text
ARCHIVA/
├── index.html    # Application markup, UI, modals, and report structure
├── style.css     # Layout, responsive styling, themes, and visual design
└── script.js     # Application logic, calculations, state management, reporting, and PDF generation
```

---

## Data & Privacy

ARCHIVA is designed to process academic information locally in the user's browser.

- Student details and grade entries are stored in **browser Local Storage** for session recovery.
- Academic data entered into ARCHIVA is **not submitted to an application backend/server**.
- Resetting the ledger removes the saved ARCHIVA session from the browser.
- Clearing browser site data may also remove the saved session.
---

## Scope & Future Enhancements

The current release is configured for **ECE under Anna University Regulation 2023 (R2023)**.

Possible future directions include:

- **Additional departments** — Support for other engineering branches.
- **Additional regulations** — Support for older and newer Anna University regulations.
- **Extended semester coverage** — Expansion as curricula evolve.
- **Broader academic configurations** — More flexible subject and grading configurations for different institutions or curricula.

The current architecture keeps the subject and grading data separate from the main application logic, making future academic configurations easier to extend.

---

## Contributors

ARCHIVA was built as a collaborative project by two contributors, with both sharing equal ownership of the design and development work:

- **Swaminathan S** — [@NeoKritus](https://github.com/NeoKritus)
- **HARINI D** — [@harini621-exe](https://github.com/harini621-exe)

---

## Academic Disclaimer

ARCHIVA is an independent academic utility created by its contributors. It is **not affiliated with, endorsed by, or produced on behalf of Anna University or any affiliated institution**.

The GPA/CGPA generated by ARCHIVA is a calculated result based on the information entered by the user and the grading configuration implemented in the application. Users are responsible for verifying the result against their institution's official academic records.

---

## License

This project does not carry an open-source license.

All rights to the **ARCHIVA name, design, content, and original source code** are reserved by the contributors. Unauthorized copying, redistribution, modification, or commercial use is strictly prohibited. **No permission or license is granted to copy, redistribute, modify, reuse, or commercially exploit any part of this project.**

---

## Contact

For queries, feedback, or project-related communication:

**neokritus@gmail.com**

---

**© 2026 ARCHIVA · ALL RIGHTS RESERVED.**
