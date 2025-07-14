document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const form = document.getElementById('pyinstaller-form');
    const outputArea = document.getElementById('output-area');
    const outputLog = document.getElementById('output-log');
    const copyBtn = document.getElementById('copy-btn');

    // Main script, icon, and version file inputs
    const scriptFileInput = document.getElementById('script-file');
    const scriptFileName = document.getElementById('script-file-name');
    const iconFileInput = document.getElementById('icon-file');
    const iconFileName = document.getElementById('icon-file-name');
    const versionFileInput = document.getElementById('version-file');
    const versionFileName = document.getElementById('version-file-name');
    const downloadVersionTemplateBtn = document.getElementById('download-version-template');

    // General options
    const appNameInput = document.getElementById('app-name');
    const onefileCheckbox = document.getElementById('onefile');
    const noconsoleCheckbox = document.getElementById('noconsole');
    const cleanCheckbox = document.getElementById('clean');
    const hiddenImportsInput = document.getElementById('hidden-imports');
    const logLevelSelect = document.getElementById('log-level');

    // --- Dynamic Field Sections ---
    const binaryConfig = {
        container: document.getElementById('binaries-container'),
        numInput: document.getElementById('num-binaries-input'),
        toggleButton: document.getElementById('binary-toggle-btn'),
        itemClass: 'binary-item',
        checkboxClass: 'binary-checkbox',
        fileInputPrefix: 'binary-file',
        fileNamePrefix: 'binary-file-name',
        label: 'Select Binary'
    };

    const dataConfig = {
        container: document.getElementById('data-container'),
        numInput: document.getElementById('num-data-input'),
        toggleButton: document.getElementById('data-toggle-btn'),
        itemClass: 'data-item',
        checkboxClass: 'data-checkbox',
        fileInputPrefix: 'data-file',
        fileNamePrefix: 'data-file-name',
        label: 'Select Data'
    };

    /**
     * Updates the file name display for a file input.
     * @param {HTMLInputElement} inputElement The file input element.
     * @param {HTMLElement} nameElement The span element to display the name.
     */
    function updateFileName(inputElement, nameElement) {
        if (inputElement.files.length > 0) {
            nameElement.textContent = inputElement.files[0].name;
            nameElement.style.color = 'var(--text-light)';
        } else {
            nameElement.textContent = 'No file selected';
            nameElement.style.color = 'var(--text-dark)';
        }
    }

    /**
     * Toggles the visibility of a collapsible dropdown section.
     * @param {HTMLElement} container The container element to toggle.
     * @param {HTMLElement} button The button that controls the toggle.
     */
    function toggleDropdown(container, button) {
        container.classList.toggle('open');
        button.classList.toggle('open');
    }

    /**
     * Creates a set of dynamic file input fields based on a configuration object.
     * @param {object} config Configuration for the dynamic fields.
     */
    function createDynamicFields(config) {
        config.container.innerHTML = '';
        let numFields = parseInt(config.numInput.value, 10);

        if (isNaN(numFields) || numFields < 1) numFields = 1;
        if (numFields > 10) numFields = 10;
        config.numInput.value = numFields;

        for (let i = 1; i <= numFields; i++) {
            const item = document.createElement('div');
            item.className = config.itemClass;
            item.innerHTML = `
                <label class="checkbox-container">
                    <input type="checkbox" class="${config.checkboxClass}" id="${config.checkboxClass}-${i}">
                    <span class="checkmark"></span>
                </label>
                <div class="file-input-wrapper disabled">
                    <label for="${config.fileInputPrefix}-${i}" class="file-label">${config.label} ${i}</label>
                    <span class="file-name" id="${config.fileNamePrefix}-${i}">No file selected</span>
                    <input type="file" id="${config.fileInputPrefix}-${i}">
                </div>
            `;
            config.container.appendChild(item);

            const checkbox = item.querySelector(`.${config.checkboxClass}`);
            const fileInput = item.querySelector(`#${config.fileInputPrefix}-${i}`);
            const fileNameSpan = item.querySelector(`#${config.fileNamePrefix}-${i}`);
            const fileInputWrapper = item.querySelector('.file-input-wrapper');

            checkbox.addEventListener('change', () => {
                fileInputWrapper.classList.toggle('disabled', !checkbox.checked);
            });
            fileInput.addEventListener('change', () => updateFileName(fileInput, fileNameSpan));
        }
    }

    /**
     * Handles the form submission to generate the PyInstaller command.
     * @param {Event} event The form submission event.
     */
    function handleFormSubmit(event) {
        event.preventDefault();
        
        if (!scriptFileInput.files[0]) {
            alert('Please select a Python script (.py) to continue.');
            return;
        }

        const command = buildCommand();
        outputLog.textContent = command;
        outputArea.style.display = 'block';
        outputArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Assembles the PyInstaller command string from form inputs.
     * @returns {string} The generated command.
     */
    function buildCommand() {
        const commandParts = ['pyinstaller'];
        
        // Basic options
        if (cleanCheckbox.checked) commandParts.push('--clean');
        if (noconsoleCheckbox.checked) commandParts.push('--noconsole');
        if (onefileCheckbox.checked) commandParts.push('--onefile');
        
        const appName = appNameInput.value.trim();
        if (appName) commandParts.push(`--name "${appName}"`);

        // File-based options
        if (iconFileInput.files[0]) commandParts.push(`--icon "${iconFileInput.files[0].name}"`);
        if (versionFileInput.files[0]) commandParts.push(`--version-file "${versionFileInput.files[0].name}"`);

        // Hidden imports
        const hiddenImports = hiddenImportsInput.value.trim();
        if (hiddenImports) {
            hiddenImports.split(',')
                .map(imp => imp.trim())
                .filter(imp => imp)
                .forEach(imp => commandParts.push(`--hidden-import ${imp}`));
        }
        
        // Log level
        if (logLevelSelect.value !== 'INFO') {
            commandParts.push(`--log-level ${logLevelSelect.value}`);
        }
        
        // Add-binary and Add-data
        appendDynamicFileArgs(commandParts, binaryConfig, '--add-binary');
        appendDynamicFileArgs(commandParts, dataConfig, '--add-data');
        
        // Main script
        commandParts.push(`"${scriptFileInput.files[0].name}"`);
        
        return commandParts.join(' ');
    }
    
    /**
     * Appends arguments for dynamic file inputs (--add-binary, --add-data) to the command.
     * @param {string[]} commandParts The array of command parts.
     * @param {object} config The configuration object for the dynamic section.
     * @param {string} flag The command-line flag (e.g., '--add-binary').
     */
    function appendDynamicFileArgs(commandParts, config, flag) {
        const numFields = parseInt(config.numInput.value, 10);
        for (let i = 1; i <= numFields; i++) {
            const checkbox = document.getElementById(`${config.checkboxClass}-${i}`);
            const fileInput = document.getElementById(`${config.fileInputPrefix}-${i}`);
            if (checkbox?.checked && fileInput?.files[0]) {
                commandParts.push(`${flag} "${fileInput.files[0].name};."`);
            }
        }
    }

    /**
     * Copies the generated command to the clipboard.
     */
    function copyCommandToClipboard() {
        if (!outputLog.textContent || outputLog.textContent.startsWith('Fill out')) return;
        
        navigator.clipboard.writeText(outputLog.textContent).then(() => {
            const copySpan = copyBtn.querySelector('span');
            const originalText = copySpan.textContent;
            copySpan.textContent = 'Copied!';
            copyBtn.classList.add('copied');
            
            setTimeout(() => {
                copySpan.textContent = originalText;
                copyBtn.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy command: ', err);
            alert('Failed to copy command.');
        });
    }

    /**
     * Creates and triggers a download for a version info file template.
     * @param {Event} event The click event.
     */
    function downloadVersionTemplate(event) {
        event.preventDefault();
        const templateContent = `# UTF-8
# For more details, see: https://pyinstaller.org/en/stable/usage.html#version-file
VSVersionInfo(
  ffi=FixedFileInfo(
    filevers=(1, 0, 0, 0),
    prodvers=(1, 0, 0, 0),
    mask=0x3f,
    flags=0x0,
    OS=0x40004,
    fileType=0x1,
    subtype=0x0,
    date=(0, 0)
    ),
  kids=[
    StringFileInfo(
      [
      StringTable(
        '040904B0',
        [StringStruct('CompanyName', 'Your Company Name'),
        StringStruct('FileDescription', 'Your Application Description'),
        StringStruct('FileVersion', '1.0.0.0'),
        StringStruct('InternalName', 'YourApp'),
        StringStruct('LegalCopyright', '© Your Company. All rights reserved.'),
        StringStruct('OriginalFilename', 'YourApp.exe'),
        StringStruct('ProductName', 'Your Product Name'),
        StringStruct('ProductVersion', '1.0.0.0')])
      ]), 
    VarFileInfo([VarStruct('Translation', [1033, 1200])])
  ]
)`;
        const blob = new Blob([templateContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'version_info_template.txt';
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    /**
     * Initializes the application by setting up event listeners and creating initial fields.
     */
    function initialize() {
        scriptFileInput.addEventListener('change', () => updateFileName(scriptFileInput, scriptFileName));
        iconFileInput.addEventListener('change', () => updateFileName(iconFileInput, iconFileName));
        versionFileInput.addEventListener('change', () => updateFileName(versionFileInput, versionFileName));
        downloadVersionTemplateBtn.addEventListener('click', downloadVersionTemplate);

        binaryConfig.numInput.addEventListener('change', () => createDynamicFields(binaryConfig));
        binaryConfig.toggleButton.addEventListener('click', () => toggleDropdown(binaryConfig.container, binaryConfig.toggleButton));
        
        dataConfig.numInput.addEventListener('change', () => createDynamicFields(dataConfig));
        dataConfig.toggleButton.addEventListener('click', () => toggleDropdown(dataConfig.container, dataConfig.toggleButton));

        form.addEventListener('submit', handleFormSubmit);
        copyBtn.addEventListener('click', copyCommandToClipboard);

        createDynamicFields(binaryConfig);
        createDynamicFields(dataConfig);
    }

    // --- Start the Application ---
    initialize();
});