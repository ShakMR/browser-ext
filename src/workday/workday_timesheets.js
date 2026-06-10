const {showToast} = require('../toast');
const {isElementVisible} = require('../elementUtils');
import daySelector from './day_selector';

const DELAY_MS = 500;

const elements = {
    tabBar: 'ul[data-automation-id=tabBar]',
    entryRow: '[data-automation-id=wd-ActiveListRowEditor-New]',
    daySection: '[data-automation-id=fieldSetBody]',
    dayLabel: '[data-automation-id=fieldSetLegendLabel]',
    tableRow: 'tr[data-automation-id=row]',
    inputElements: [
        '[data-automation-id=standaloneTimeWidget] > input',
        '[data-automation-id=standaloneTimeWidget] input',
        '[data-automation-id*=Time] input',
        '[data-automation-id*=time] input',
        'input[type=time]',
    ].join(','),
    okButton: '[data-automation-id=wd-CommandButton_uic_okButton]'
}

const dayMatchers = [
    /\b(sun|sunday|dom|domingo)\b/i,
    /\b(mon|monday|lun|lunes)\b/i,
    /\b(tue|tuesday|mar|martes)\b/i,
    /\b(wed|wednesday|mie|miercoles)\b/i,
    /\b(thu|thursday|jue|jueves)\b/i,
    /\b(fri|friday|vie|viernes)\b/i,
    /\b(sat|saturday|sab|sabado)\b/i,
];

const nonWorkingMatcher = /\b(holiday|brite\s*break|britebreak|festivo|absence|time\s*off|leave|vacation|vacaciones)\b/i;
const timeInputMatcher = /\b(in|out|start|end|entrada|salida)\b/i;
const nonTimeInputMatcher = /\b(search|find|filter|comment|note)\b/i;
const inputTypeMatcher = /^(|text|time|tel)$/i;

const getText = (element) => (element?.innerText || element?.textContent || '').trim();
const normalizeText = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const getTimeWidget = (input) => input.closest('[data-automation-id=standaloneTimeWidget]');
const isVisibleTimeWidgetInput = (input) => {
    const widget = getTimeWidget(input);
    return !!widget && isElementVisible(widget) && widget.getAttribute('data-uxi-widget-editable') !== 'false';
}

const isInputWritable = (input) => (
    (isElementVisible(input) || isVisibleTimeWidgetInput(input))
    && !input.disabled
    && input.getAttribute('aria-disabled') !== 'true'
    && !input.readOnly
    && inputTypeMatcher.test(input.type || '')
);

const getInputValue = (input) => input.value || getText(getTimeWidget(input)?.querySelector('.gwt-Label'));
const hasValue = (input) => getInputValue(input) !== '';

const getInputText = (input) => [
    input.getAttribute('aria-label'),
    input.getAttribute('placeholder'),
    input.getAttribute('name'),
    input.getAttribute('id'),
    input.getAttribute('data-automation-id'),
    input.closest('[data-automation-id]')?.getAttribute('data-automation-id'),
].filter(Boolean).join(' ');

const isLabeledTimeInput = (input) => {
    const inputText = getInputText(input);
    return timeInputMatcher.test(inputText) && !nonTimeInputMatcher.test(inputText);
}

const getDayIndex = (element, fallbackIndex) => {
    const text = normalizeText(getText(element));
    const matchedIndex = dayMatchers.findIndex((matcher) => matcher.test(text));
    return matchedIndex >= 0 ? matchedIndex : fallbackIndex + 1;
}

const hasNonWorkingEntry = (element) => nonWorkingMatcher.test(getText(element));
const getRowType = (row) => Array.from(row.querySelectorAll('[data-automation-id=promptOption]'))
    .map((label) => label.getAttribute('data-automation-label') || getText(label))
    .join(' ');
const isWorkedTimeRow = (row) => {
    const rowType = getRowType(row);
    return !rowType || /\bworked time\b/i.test(rowType);
}

const getTabButtonsForWorkingDays = (workingDaysArray) => {
    const tabBar = document.querySelector(elements.tabBar);
    if (!tabBar) {
        return [];
    }

    return Array.from(tabBar.children)
        .filter(((tabEl, index) => workingDaysArray[index] && isElementVisible(tabEl)));
}

const selectTab = async (tab) => {
    showToast(`Selecting tab ${tab.innerText}`);
    tab.click();
    await userDelay(DELAY_MS);
}

const writeInput = async (input, time) => {
    if (!input || hasValue(input)) {
        return false;
    }

    console.log('Writing time', input, time);
    (getTimeWidget(input) || input).click();
    if (isElementVisible(input)) {
        input.focus();
    }
    await userDelay(DELAY_MS/10);
    setInputValue(input, time);
    const widgetLabel = getTimeWidget(input)?.querySelector('.gwt-Label');
    if (widgetLabel && !getText(widgetLabel)) {
        widgetLabel.textContent = time;
    }
    await userDelay(DELAY_MS/10);
    input.dispatchEvent(new Event('input', {bubbles: true}));
    input.dispatchEvent(new Event('change', {bubbles: true}));
    getTimeWidget(input)?.dispatchEvent(new Event('change', {bubbles: true}));
    input.dispatchEvent(new Event('blur'));
    await userDelay(DELAY_MS);
    return true;
}

const setInputValue = (input, value) => {
    const ownSetter = Object.getOwnPropertyDescriptor(input, 'value')?.set;
    const prototypeSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')?.set;

    if (prototypeSetter && ownSetter !== prototypeSetter) {
        prototypeSetter.call(input, value);
    } else {
        input.value = value;
    }
}

const userDelay = (timeMs) => new Promise(resolve => setTimeout(resolve, timeMs));

const getVisibleRowElement = () => Array.from(document.querySelectorAll(elements.entryRow)).filter(isElementVisible);

const unique = (items) => [...new Set(items)];

const getInputControlsFromRowElement = (rowElement) => {
    if (!rowElement) {
        return [];
    }

    const inputs = Array.from(rowElement.querySelectorAll(elements.inputElements)).filter(isInputWritable);
    const labeledInputs = Array.from(rowElement.querySelectorAll('input')).filter((input) => isInputWritable(input) && isLabeledTimeInput(input));
    const timeInputs = unique([...inputs, ...labeledInputs]);

    if (timeInputs.length >= 2) {
        return timeInputs;
    }

    const genericInputs = Array.from(rowElement.querySelectorAll('input')).filter(isInputWritable);
    return genericInputs.length === 2 ? genericInputs : timeInputs;
}

const setTimeForDay = async (workingHours) => {
    const entryRowElement = getVisibleRowElement();
    const [startInput, endInput] = getInputControlsFromRowElement(entryRowElement[0]);

    return [
        await writeInput(startInput, workingHours.start),
        await writeInput(endInput, workingHours.end),
    ].some(Boolean);
}

const getWeekDaySections = () => Array.from(document.querySelectorAll(elements.daySection))
    .map((section, index) => ({
        section,
        label: section.querySelector(elements.dayLabel),
        dayIndex: getDayIndex(section.querySelector(elements.dayLabel), index),
    }))
    .filter(({section, label, dayIndex}) => label && dayIndex >= 0 && section.querySelector(elements.tableRow));

const getEditableRowFromSection = (section) => {
    const rows = Array.from(section.querySelectorAll(elements.tableRow))
        .filter((row) => !hasNonWorkingEntry(row) && isWorkedTimeRow(row))
        .filter((row) => getInputControlsFromRowElement(row).length >= 2);

    return rows.find((row) => getInputControlsFromRowElement(row).some(hasValue)) || rows[0];
}

const setTimeForWeekRows = async (selectedDays, workingHours) => {
    const sections = getWeekDaySections();
    let editedRows = 0;

    for (const {section, dayIndex} of sections) {
        if (!selectedDays[dayIndex] || hasNonWorkingEntry(section)) {
            continue;
        }

        const row = getEditableRowFromSection(section);
        const [startInput, endInput] = getInputControlsFromRowElement(row);
        const edited = [
            await writeInput(startInput, workingHours.start),
            await writeInput(endInput, workingHours.end),
        ].some(Boolean);

        if (edited) {
            editedRows++;
        }
    }

    return editedRows;
}

const clickOkButton = () => {
    document.querySelector(elements.okButton)?.click();
}

export const writeTimeTable = async () => {
    const selectedDays = daySelector.getActiveDays();
    const workingHours = daySelector.getActiveHours();

    const tabButtons = getTabButtonsForWorkingDays(selectedDays);
    if (!tabButtons.length) {
        const editedRows = await setTimeForWeekRows(selectedDays, workingHours);
        showToast(editedRows ? `Updated ${editedRows} day(s)` : 'No matching empty time entries found');
        if (editedRows) {
            clickOkButton();
        }
        return;
    }

    for (const tab of tabButtons) {
        await selectTab(tab);
        await setTimeForDay(workingHours);
        await userDelay(DELAY_MS);
    }

    clickOkButton();
}
