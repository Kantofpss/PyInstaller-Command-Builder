document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('pyinstaller-form');
    const outputArea = document.getElementById('output-area');
    const outputLog = document.getElementById('output-log');
    const copyBtn = document.getElementById('copy-btn');

    
    const scriptFileInput = document.getElementById('script-file');
    const scriptFileName = document.getElementById('script-file-name');
    const iconFileInput = document.getElementById('icon-file');
    const iconFileName = document.getElementById('icon-file-name');
    const versionFileInput = document.getElementById('version-file');
    const versionFileName = document.getElementById('version-file-name');
    const downloadVersionTemplateBtn = document.getElementById('download-version-template');

    
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

    function updateFileName(inputElement, nameElement) {
        if (inputElement.files.length > 0) {
            nameElement.textContent = inputElement.files[0].name;
            nameElement.style.color = 'var(--text-light)';
        } else {
            nameElement.textContent = 'No file selected';
            nameElement.style.color = 'var(--text-dark)';
        }
    }

    
    function toggleDropdown(container, button) {
        container.classList.toggle('open');
        button.classList.toggle('open');
    }

    
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

    
    function buildCommand() {
        const commandParts = ['pyinstaller'];
        
        
        if (cleanCheckbox.checked) commandParts.push('--clean');
        if (noconsoleCheckbox.checked) commandParts.push('--noconsole');
        if (onefileCheckbox.checked) commandParts.push('--onefile');
        
        const appName = appNameInput.value.trim();
        if (appName) commandParts.push(`--name "${appName}"`);

        
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
        
        
        if (logLevelSelect.value !== 'INFO') {
            commandParts.push(`--log-level ${logLevelSelect.value}`);
        }
        
        
        appendDynamicFileArgs(commandParts, binaryConfig, '--add-binary');
        appendDynamicFileArgs(commandParts, dataConfig, '--add-data');
        
        
        commandParts.push(`"${scriptFileInput.files[0].name}"`);
        
        return commandParts.join(' ');
    }
    
    
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
