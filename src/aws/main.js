import {getTemplateString, TemplateNames} from './templates.js';
import {
  getAccountWrappers, getRolesContainer
} from "./selectors";
import {clickSignIn} from "./signIn";
import {createDiv} from "../elementUtils";
import {randomFloatBetween} from "./utils";
import {getAccountInfo, groupAccountsBasedOnName} from "./accounts";
import {
  addClickListener,
  createElement,
  createElementWithWrapper,
  replaceForm
} from "./dom";

const colorsMap = {
  prod: '#a3d9ff',    // Light blue
  preprod: '#ffb3e6', // Light pink
  dev: '#99ff99',     // Light green (unchanged)
  test: '#9999ff',    // Light blue (unchanged)
  orchestration: '#ffd9b3', // Light peach
}

const getAllAccounts = () => {
  const accountWrappers = getAccountWrappers();
  const accounts = accountWrappers
    .map(getAccountInfo)
    .sort((a, b) => a.service.localeCompare(b.service));
  return groupAccountsBasedOnName(accounts);
}

const createAccountWrapper = (account, total) => {
  const template = getTemplateString(TemplateNames.accountWrapper);
  const data = {...account, n: randomFloatBetween(0, total)};
  return createElement(template, data);
}

const clickAccount = (account) => () => {
  account.checkbox.click();
  clickSignIn();
}

const createAccountButton = (account) => {
  const template = getTemplateString(TemplateNames.button);
  const data = {...account, bgc: colorsMap[account.stage]}
  return createElementWithWrapper(template, data);
}

const addAccountButtons = (container, accounts) => {
  accounts.forEach((account) => {
    const wrapper = createAccountButton(account);
    addClickListener(account.roleId, clickAccount(account), wrapper);
    container.appendChild(wrapper);
  });
}

const handleSearch = (event, force = false) => {
  const searchTerm = event.target.value.toLowerCase();
  const shouldAct = searchTerm.length >= 3 || searchTerm.length === 0;
  if (!force && !shouldAct) {
    return;
  }

  const accountWrappers = document.querySelectorAll('.accountWrapper');
  accountWrappers.forEach(wrapper => {
    const serviceName = wrapper.querySelector('h2').textContent.toLowerCase();
    const shouldShow = serviceName.includes(searchTerm);
    wrapper.style.display = shouldShow ? 'block' : 'none';
  });
};

export const main = () => {
  const accounts = getAllAccounts();
  
  const wrapper = createDiv('aws-wrapper');
  const searchBar = createElement(getTemplateString(TemplateNames.searchBar));
  const searchInput = searchBar.querySelector('#search-bar');
  searchInput.addEventListener('input', handleSearch);
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handleSearch(event, true);
    }
  });
  wrapper.appendChild(searchBar);

  const container = createDiv('aws-accounts');

  const projects = Object.keys(accounts);
  for (const serviceName of projects) {
    const serviceAccounts = accounts[serviceName];
    const accountContainer = createAccountWrapper({service: serviceName}, projects.length);
    const rolesContainer = getRolesContainer(serviceName, accountContainer);
    addAccountButtons(rolesContainer, serviceAccounts);
    accountContainer.appendChild(rolesContainer);
    container.appendChild(accountContainer);
  }
  wrapper.appendChild(container);
  replaceForm(wrapper)
  searchInput.focus();
}

main();
