# ARCHIVA — Academic Ledger

ARCHIVA is a browser-based academic record tool that helps students track their semester grades and calculate their GPA and CGPA. It presents the process as a simple ledger: file your grades, and get a clear, shareable result along with a detailed academic report.

**Live application:** https://neokritus.github.io/ARCHIVA/

## Overview

Instead of running CGPA calculations by hand or through scattered spreadsheets, ARCHIVA gives students a structured interface to file their academic record. A student enters their details, selects the semesters they want to file, marks a grade for every subject, and instantly receives a calculated CGPA. The full academic report — including a subject-wise breakdown and arrear tracking — can then be reviewed, downloaded as a PDF, or shared directly.

The current version is configured for the Electronics and Communication Engineering (ECE) syllabus under Anna University's Regulation 2023, but the underlying logic is written to be extended well beyond that — see [Scope & Future Enhancements](#scope--future-enhancements) below.

## Features

- **Semester-wise grade entry** — Select any combination of semesters, in any order, and enter grades subject by subject.
- **Instant CGPA calculation** — Grades are converted to grade points and calculated the moment the record is submitted.
- **Detailed academic report** — A complete, subject-wise breakdown of every filed semester, including credits and grade points.
- **Arrear tracking** — Subjects with an arrear grade are automatically flagged and listed separately in the report.
- **Downloadable PDF reports** — Export either a short academic result or the complete academic report as a formatted PDF, complete with watermarking and page numbering.
- **Shareable results** — Copy a summary of the result or share the generated PDF directly from the app.
- **Session recovery** — An unfinished ledger is saved locally and can be restored the next time the app is opened.
- **Light and dark themes** — Switch between themes at any time; the preference is remembered across visits.
- **Fully client-side** — All calculations run in the browser. No data is ever sent to or stored on a server.

## How It Works

1. Enter the student's name, roll number, department, and regulation.
2. Select one or more semester sheets to file.
3. Assign a grade to every subject listed in the active semester sheet.
4. Select **Calculate & Seal** to generate the CGPA.
5. Review the result, or open the complete academic report for a full subject-wise breakdown.
6. Download or share the result as a PDF.

If any required information is missing or invalid, ARCHIVA highlights the specific field so it can be corrected before proceeding.

## Tech Stack

- **HTML5** and **CSS3** for structure and styling
- **Vanilla JavaScript** for all application logic and state management
- [**jsPDF**](https://github.com/parallax/jsPDF) and **jsPDF-AutoTable** for PDF report generation
- [**PDF.js**](https://mozilla.github.io/pdf.js/) for in-browser PDF preview
- [**html2canvas**](https://github.com/niklasvh/html2canvas) for rendering result captures

No backend, build tools, or external frameworks are used — the application runs entirely as static files in the browser.

## Project Structure

```
ARCHIVA/
├── index.html    # Application markup and structure
├── style.css     # Styling, theming, and layout
└── script.js     # Application logic, grade calculation, and PDF generation
```

## Scope & Future Enhancements

ARCHIVA currently supports one department (ECE) under one regulation (Anna University R2023), but its subject and grading data is structured so that this coverage can grow over time. Planned or possible directions include:

- **Additional departments** — Extending subject and credit data to cover other engineering branches.
- **Additional regulations** — Supporting older or newer Anna University regulations alongside R2023.
- **Extended semester coverage** — Adding support for more semesters as curricula evolve.

Contributions or suggestions toward any of these areas are welcome.

## Data & Privacy

All calculations happen locally, in the user's own browser. Student details and grade entries are stored only on the user's device, purely to allow an in-progress session to be recovered. No information is transmitted to or stored on any external server.

## Contributors

ARCHIVA was built as a collaborative project by two contributors, with both sharing equal ownership of the design and development work:

- **Swaminathan S** — [@NeoKritus](https://github.com/NeoKritus)
- **HARINI D** — [@harini621-exe](https://github.com/harini621-exe)

## Academic Disclaimer

ARCHIVA is an independent project built entirely by its contributors. It is not affiliated with, endorsed by, or produced on behalf of Anna University or any affiliated institution. The CGPA displayed is a self-calculated estimate for personal reference and should always be verified against the official transcript issued by the university.

## License

This project does not carry an open-source license. All rights to the design, content, and source code are reserved by the contributors, and no part of this repository may be copied, reproduced, modified, or reused without prior written permission.

## Contact

For queries related to this project, reach out at: **neokritus@gmail.com**
