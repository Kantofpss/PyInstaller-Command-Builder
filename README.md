PyInstaller Command Builder
Overview
This project is a web-based tool designed to simplify the process of generating PyInstaller commands for compiling Python scripts into executable files. Instead of manually writing complex PyInstaller commands in the terminal, this tool provides an intuitive interface where users can select their Python script, configure options, and generate a ready-to-use command with a single click. 
This project was created by Kantofpss as a beginner in programming, with the goal of making the compilation process easier and more accessible for others who may also be new to programming or unfamiliar with PyInstaller's command-line interface.
Features

Python Script Selection: Choose your .py file to compile.
Customizable Options: Set executable name, single file output, console visibility, and more.
Dynamic File Inputs: Add additional binaries and data files (up to 10 each) with checkbox controls.
Hidden Imports: Specify modules to include with comma-separated input.
Log Level Selection: Choose from TRACE, DEBUG, INFO, WARN, ERROR, or CRITICAL.
Icon and Version File Support: Add an icon (.ico) or version file (.txt) for the executable.
Version File Template: Download a sample version file template for PyInstaller.
Generated Command Output: View and copy the complete PyInstaller command to your clipboard.

How to Use

Visit the tool online at PyInstaller Command Builder or open index.html in a web browser.
Fill out the form with your desired options:
Select your Python script (required).
Optionally specify an executable name, icon, or version file.
Add hidden imports, binaries, or data files as needed.
Choose a log level if desired.


Click Generate Command to create the PyInstaller command.
Copy the generated command from the output area and run it in your terminal where PyInstaller is installed.

Files

index.html: The main HTML file containing the form and structure.
style.css: Stylesheet for the web interface, using a dark theme with responsive design.
script.js: JavaScript logic for handling form inputs, generating commands, and managing dynamic fields.

Notes

This tool assumes you have PyInstaller installed in your environment.
The interface is designed to be user-friendly, especially for those new to programming or PyInstaller.
As a beginner project, there may be areas for improvement—feedback is welcome!

Author
Created by Kantofpss, a new programmer passionate about creating tools to simplify development tasks.