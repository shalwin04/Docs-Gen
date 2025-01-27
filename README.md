# Documentation Generator with LangChain and Google Generative AI

This project is a **Documentation Generator** for local repositories that leverages **LangChain**, **Google Generative AI (Gemini-1.5-flash)**, and **LangGraph** to analyze code and generate detailed, high-quality API documentation. The tool processes JavaScript and TypeScript files, splits them into manageable chunks, and generates documentation with suggestions for improvement.

---

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Configuration](#configuration)
5. [Technologies Used](#technologies-used)
6. [File Structure](#file-structure)
7. [Future Improvements](#future-improvements)
8. [License: MIT](https://github.com/shalwin04/Docs-Gen?tab=MIT-1-ov-file)

---

## Features

- Automatically loads and analyzes files from a specified directory.
- Uses Google Generative AI to generate detailed documentation for:
  - **API Endpoints**
  - **Functions and Methods**
  - **Data Models**
  - **Design Patterns**
  - **Security Considerations**
- Includes a reflection step for documentation critique and improvement.
- Implements LangGraph for iterative workflows.
- Provides customizable chunk size and overlap for text splitting.
- Streams results to handle large outputs efficiently.

---

## Usage

### Installation

### Prerequisites

Ensure the following are installed on your machine:

- Node.js (v18+ recommended)
- npm or yarn
- Google API Key for Generative AI
- Unstructured API Key (optional, for advanced text loading)

### Steps

1. Install the package
   ```bash
   npm install docs-gen-js-ts
   ```
2. RUn the script

   ```bash
   docs-gen
   ```

   - The project will scan the specified directory (**process.cwd()** by default), split the documents, and generate API documentation based on the loaded code files.

### Technologies Used

- **LangChain:** Framework for building AI-driven workflows.
- **Google Generative AI (Gemini):** Generates detailed and insightful documentation.
- **LangGraph:** Manages iterative workflows with state graphs.
- **TypeScript:** Ensures type safety and maintainability.
- **Node.js:** Executes the backend logic.

### Future Improvements

- Add support for more programming languages.
- Integrate with cloud storage for generated documentation.
- Improve error handling for edge cases (e.g., large repositories).
- Enhance the reflection process with additional critique points.

Developed by Shalwin.
If you have questions or feedback, feel free to reach out!

- **Email** : [shalwinsanju.25cs@licet.ac.in]
- **Github** : [shalwin04](https://github.com/shalwin04)
