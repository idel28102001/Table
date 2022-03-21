import { iconsDb, dbSelect } from "./db.js";
import { insertAfter, validAllFields, unmaskPhone } from "./validate.js";
import { parseForm } from "./parse.js";
import { postElem, deleteElem, patchElem } from "./requests.js";
import { createFirst } from "./createReqs.js";
import { checkIfErrors } from "./errorPreprocess.js";

const back = document.querySelector(".back");
const backContent = document.querySelector(".back__content");

const crossCancel = document.createElement("button");
crossCancel.classList.add("cross__cancel");
crossCancel.innerHTML = iconsDb.CrossCancel;
backContent.appendChild(crossCancel);
crossCancel.addEventListener("click", () => {
  back.classList.remove("is-active");
});

const addClient = document.querySelector(".contacts__button-add");
addClient.addEventListener("click", () => {
  createEmptyField("Новый клиент");
});
let currIdTime;
document.querySelector(".header__input").addEventListener("input", (e) => {
  const currValue = e.currentTarget.value.trim();
  clearTimeout(currIdTime);
  currIdTime = setTimeout(() => {
    createFirst(currValue);
  }, 300);
});

export function sortRows(array, bodyTable, oldDb) {
  array.forEach((e) => {
    e.addEventListener("click", () => {
      bodyTable.innerHTML = "";
      const currData = e.getAttribute("data-btn");
      let newDB = filterByBtn(oldDb, currData);
      const currBtn = document.querySelector(`[data-btn="${currData}"]`);
      if (
        !(
          currBtn.classList.contains("data-reverse-false") ||
          currBtn.classList.contains("data-reverse-true")
        )
      ) {
        array.forEach((currE) => {
          currE.classList.remove("data-reverse-true");
          currE.classList.remove("data-reverse-false");
        });
        currBtn.classList.add("data-reverse-false");
      } else {
        if (currBtn.classList.contains("data-reverse-false")) {
          currBtn.classList.add("data-reverse-true");
          currBtn.classList.remove("data-reverse-false");
          newDB = newDB.reverse();
        } else {
          currBtn.classList.remove("data-reverse-true");
          currBtn.classList.add("data-reverse-false");
        }
      }
      for (let curr of newDB) {
        createRow(curr, bodyTable);
      }
    });
  });
  bodyTable.innerHTML = "";
  for (let curr of oldDb) {
    createRow(curr, bodyTable);
  }
  const currIdBtn = document.querySelector(`button[data-btn="id"]`);
  currIdBtn.click();
}

export function createRow(inpDict, bodyTable) {
  const dataArray = eventDicts(inpDict);
  const currRow = document.createElement("tr");
  currRow.classList.add("table__row-body");
  for (let i = 0; i < 6; i++) {
    const currData = document.createElement("td");
    currData.classList.add("table__cell", "table_data");

    switch (i) {
      case 0:
        const idLink = document.createElement("span");
        idLink.classList.add("table__id");
        idLink.textContent = dataArray[i];
        currData.append(idLink);
        break;
      case 1:
        currData.textContent = dataArray[i];
        break;
      case 2:
      case 3:
        const [date, time] = dataArray[i];
        const currDate = document.createElement("span");
        currDate.classList.add("table__date");
        currDate.textContent = date;
        const currTime = document.createElement("span");
        currTime.classList.add("table__time");
        currTime.textContent = time;
        currData.append(currDate, currTime);
        break;
      case 4:
        const currLinks = document.createElement("div");
        currLinks.classList.add("table__contacts-data");
        for (let { type, value } of inpDict.contacts) {
          const currBtn = document.createElement("button");
          currBtn.classList.add("table__contacts-icon-button");
          const currHtml = new DOMParser().parseFromString(
            iconsDb[type],
            "text/xml"
          ).firstChild;
          currHtml.classList.add("icon");
          currBtn.append(createLink(type, value), currHtml);
          currLinks.appendChild(currBtn);
        }
        currData.appendChild(currLinks);
        if (inpDict.contacts.length > 5) {
          currLinks.classList.add("table__more-btns");
          const currBtnMore = document.createElement("button");
          currBtnMore.classList.add("table__contacts-icon-more");
          currBtnMore.textContent = `+${inpDict.contacts.length - 4}`;
          currLinks.appendChild(currBtnMore);
          currBtnMore.addEventListener("click", () => {
            currLinks.classList.remove("table__more-btns");
          });
        }
        break;
      case 5:
        const [changeBtn, deleteBtn] = [
          changeDeleteBtns("Change"),
          changeDeleteBtns("Delete"),
        ];
        changeBtn.addEventListener("click", () => {
          createEmptyField("Изменить данные", inpDict, {
            id: inpDict.id,
          });
        });
        deleteBtn.addEventListener("click", () => {
          createEmptyField("Удалить клиента", null, {
            id: inpDict.id,
          });
        });

        currData.append(changeBtn, deleteBtn);
    }

    currRow.appendChild(currData);
  }
  bodyTable.appendChild(currRow);
}

function filterByBtn(db, currData) {
  switch (currData) {
    case "id":
      return db.sort(forId);
    case "name":
      return db.sort(forNames);
    case "create":
      return db.sort(forCreate);
    case "change":
      return db.sort(forChange);
  }
}

function forNames(curr1, curr2) {
  const curr1Str = `${curr1.surname.trim()}${curr1.name.trim()}${curr1.lastName.trim()}`;
  const curr2Str = `${curr2.surname.trim()}${curr2.name.trim()}${curr2.lastName.trim()}`;
  if (curr1Str < curr2Str) return -1;
  else if (curr1Str > curr2Str) return 1;
  else return 0;
}

function forId(curr1, curr2) {
  const curr1Str = Number(curr1.id);
  const curr2Str = Number(curr2.id);
  if (curr1Str < curr2Str) return -1;
  else if (curr1Str > curr2Str) return 1;
  else return 0;
}
function forCreate(curr1, curr2) {
  const curr1Str = new Date(curr1.createdAt).getTime();
  const curr2Str = new Date(curr2.createdAt).getTime();
  if (curr1Str < curr2Str) return -1;
  else if (curr1Str > curr2Str) return 1;
  else return 0;
}
function forChange(curr1, curr2) {
  const curr1Str = new Date(curr1.updatedAt).getTime();
  const curr2Str = new Date(curr2.updatedAt).getTime();
  if (curr1Str < curr2Str) return -1;
  else if (curr1Str > curr2Str) return 1;
  else return 0;
}

function eventDicts(currDict) {
  const resArray = [];
  resArray.push(currDict.id);
  const resName = `${currDict.surname} ${currDict.name} ${currDict.lastName}`;
  resArray.push(resName);
  resArray.push(eventDate(currDict.createdAt));
  resArray.push(eventDate(currDict.updatedAt));
  resArray.push(currDict.contacts);
  resArray.push(["Изменить", "Удалить"]);
  return resArray;
}

function eventDate(time) {
  const currTime = new Date(time);
  const resDate = `${String(currTime.getDate()).padStart(2, "0")}.${String(
    currTime.getMonth() + 1
  ).padStart(2, "0")}.${currTime.getFullYear()}`;
  const resTime = `${String(currTime.getHours()).padStart(2, "0")}:${String(
    currTime.getMinutes()
  ).padStart(2, "0")}`;
  return [resDate, resTime];
}

function createLink(type, value) {
  const currSpan = document.createElement("span");
  currSpan.classList.add("tooltip");
  const currType = document.createElement("p");
  currType.classList.add("tooltip__label");
  const currLink = document.createElement("a");
  currLink.classList.add("tooltip__a");
  currSpan.append(currType, currLink);
  switch (type) {
    case "Phone":
      currType.textContent = "Телефон:";
      currLink.textContent = value;
      currLink.href = `tel:+7${unmaskPhone(value)}`;
      return currSpan;
    case "Email":
      currType.textContent = `${type}:`;
      currLink.textContent = value;
      currLink.href = `mailto:${value}`;
      return currSpan;
    case "Twitter":
      currType.textContent = "Twitter:";
      currLink.textContent = value;
      currLink.href = value;
      return currSpan;
    case "Vk":
    case "Facebook":
      currType.textContent = `${type}:`;
      currLink.textContent = "Профиль";
      currLink.href = value;
      return currSpan;
  }
}
function changeDeleteBtns(currName) {
  const currChange = document.createElement("button");
  currChange.classList.add("table__data-button");

  const currIcon = document.createElement("span");
  currIcon.classList.add("table__data-icon");
  const currLabel = document.createElement("span");
  currLabel.classList.add("table__dataLabel");
  currChange.append(currIcon, currLabel);
  let currHtml;
  switch (currName) {
    case "Change":
      currChange.classList.add("table__сhange-button");
      currHtml = new DOMParser().parseFromString(
        iconsDb[currName],
        "text/xml"
      ).firstChild;
      currLabel.textContent = "Изменить";
      break;
    case "Delete":
      currChange.classList.add("table__delete-button");
      currHtml = new DOMParser().parseFromString(
        iconsDb[currName],
        "text/xml"
      ).firstChild;
      currLabel.textContent = "Удалить";
  }
  currIcon.appendChild(currHtml);
  return currChange;
}

function createEmptyField(title, dict = false, needDict = null) {
  back.classList.add("is-active");
  while (backContent.children.length > 1) {
    backContent.children[1].remove();
  }
  const up = document.createElement("div");
  up.classList.add("back__content-container", "form__up");
  const headDiv = document.createElement("div");
  const heading = document.createElement("h3");
  heading.textContent = title;
  heading.classList.add("form-heading");
  headDiv.classList.add("form__head-div");

  const form = document.createElement("form");
  form.classList.add("form");

  if (title !== "Удалить клиента") {
    const surname = createInput(["Фамилия", "surname"], dict.surname, true);
    const currName = createInput(["Имя", "name"], dict.name, true);
    const lastName = createInput(["Отчество", "lastName"], dict.lastName);
    up.append(surname, currName, lastName);
  }
  headDiv.append(heading);
  up.prepend(headDiv);

  const down = document.createElement("div");
  const currContacts = document.createElement("div");
  if (title !== "Удалить клиента") {
    currContacts.classList.add("form__contacts");
    down.classList.add("form__down");
    const addCont = document.createElement("button");
    addCont.type = "button";
    addCont.classList.add("form__add-сontact", "is-active");
    addCont.textContent = "Добавить контакт";
    addCont.addEventListener(
      "click",
      createContactField.bind(null, { down, currContacts, addCont })
    );

    if (dict) {
      const currId = document.createElement("span");
      currId.classList.add("form__heading-id");
      currId.textContent = `ID: ${dict.id}`;
      headDiv.append(currId);

      for (let { type, value } of dict.contacts) {
        const currContact = createContactField(
          { down, currContacts, addCont },
          type,
          value
        );
        addMaskEvent(currContact);
        setAttr(currContact);
      }
    }

    down.append(currContacts, addCont);
  }

  const someButton = document.createElement("button");
  someButton.classList.add("form__sumbit");
  someButton.type = "sumbit";

  if (title !== "Удалить клиента") {
    someButton.textContent = "Сохранить";
  } else {
    headDiv.classList.add("remove-client");
    const descr = document.createElement("span");
    descr.classList.add("remove-descr");
    descr.textContent = "Вы действительно хотите удалить данного клиента?";
    insertAfter(headDiv, descr);
    someButton.textContent = "Удалить";
  }
  switch (title) {
    case "Новый клиент":
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (validAllFields(form, currContacts)) {
          restartSpin(someButton, "Сохранить");
          postElem(parseForm(form)).then(async (req) => {
            const errors = await req.json();
            checkIfErrors({
              req,
              errors,
              back,
              form,
              currContacts,
              spin: { someButton, title: "Сохранить" },
            });
          });
        }
      });
      break;
    case "Удалить клиента":
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        someButton.innerHTML = "Удалить";
        someButton.append(createSpin());
        deleteElem(needDict.id).then(async (req) => {
          const errors = await req.json();
          checkIfErrors({
            req,
            errors,
            back,
            form,
            currContacts,
            spin: { someButton, title: "Удалить" },
          });
        });
      });
      break;
    case "Изменить данные":
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (validAllFields(form, currContacts)) {
          restartSpin(someButton, "Сохранить");
          patchElem(parseForm(form), needDict.id).then(async (req) => {
            const errors = await req.json();
            checkIfErrors({
              req,
              errors,
              back,
              form,
              currContacts,
              spin: { someButton, title: "Сохранить" },
            });
          });
        }
      });
  }

  const cancelBtn = document.createElement("button");
  cancelBtn.classList.add("form__cancel");
  cancelBtn.type = "button";
  if (dict) {
    cancelBtn.textContent = "Удалить контакт";
    cancelBtn.addEventListener("click", () => {
      createEmptyField("Удалить клиента", null, {
        id: needDict.id,
      });
    });
  } else {
    cancelBtn.textContent = "Отмена";
    cancelBtn.addEventListener("click", () => {
      back.classList.remove("is-active");
    });
  }

  form.append(up, down, someButton, cancelBtn);

  form.addEventListener("sumbit", (e) => {
    e.preventDefalut();
  });
  backContent.append(form);
}

function firstSecurity(elem) {
  elem.addEventListener("keypress", (event) => {
    if (/[ \@0-9]/gi.test(event.key)) {
      event.preventDefault();
    }
  });
  return elem;
}

export function restartSpin(elem, title, del = false) {
  elem.innerHTML = title;
  elem.append(createSpin());
  if (del) {
    elem.innerHTML = title;
  }
}

function createInput(placeHold, value = "", star = false) {
  const currSpan = document.createElement("span");
  currSpan.classList.add("form__span");
  const currName = firstSecurity(document.createElement("input"));
  currName.classList.add("form__input");
  const currNameLabel = document.createElement("label");
  currNameLabel.classList.add("form__label", "is-active");
  if (!value) {
    currName.addEventListener("input", () => {
      if (currName.value) {
        currNameLabel.classList.remove("is-active");
      } else {
        currNameLabel.classList.add("is-active");
      }
    });
  } else {
    currName.value = value;
    currNameLabel.classList.add("form__label-change");
  }
  currNameLabel.textContent = placeHold[0];
  currName.setAttribute("data-name", placeHold[1]);
  if (star) {
    currName.setAttribute("data-validate-field", "name");
    currNameLabel.classList.add("star");
  } else {
    currName.setAttribute("data-validate-field", "nameNotReq");
  }
  currSpan.append(currNameLabel, currName);
  return currSpan;
}

function select(db, selected = "Phone") {
  const elem = document.createElement("select");
  elem.classList.add("form__contact-bar");
  for (let [key, value] of Object.entries(db)) {
    const currElem = document.createElement("option");
    currElem.classList.add("bar__option");
    currElem.value = value;
    currElem.textContent = key;
    if (value === selected) {
      currElem.selected = true;
    }
    elem.append(currElem);
  }
  return elem;
}

function addMaskEvent(currContact) {
  forMask(currContact);
  currContact.firstChild.addEventListener("change", () => {
    currContact.children[1].value = "";
    forMask(currContact);
  });
}

function forMask(elem) {
  const currValue = elem.firstChild.firstChild.firstChild.firstChild.value;
  switch (currValue) {
    case "Phone":
      elem.setAttribute("data-value", currValue);
      const currMask = new Inputmask("+7 (999)-999-99-99");
      currMask.mask(elem.children[1]);
      break;
    default:
      if (elem.children[1].inputmask) {
        elem.children[1].inputmask.remove();
      }
      elem.setAttribute("data-value", currValue);
  }
}

function setAttr(elem) {
  const currId = elem.getAttribute("data-id");
  const currValue = elem.getAttribute("data-value");
  elem.setAttribute("data-attr", `${currId}-${currValue}`);
}

function createSpin(spinName = "") {
  const spinner = document.createElement("span");
  spinner.classList.add("spinner");
  switch (spinName) {
    case "Main":
      spinner.innerHTML = iconsDb.spinnerMain;
      spinner.classList.add("spinner-main");
      break;
    default:
      spinner.innerHTML = iconsDb.spinnerSmall;
      spinner.classList.add("spinner-small");
      spinner.firstChild.classList.add("spinner-icon");
  }
  return spinner;
}

export function createEmpty(elem) {
  const empty = document.createElement("div");
  empty.append(createSpin("Main"));

  empty.classList.add("main-empty");
  elem.append(empty);
}

function createContactField(needDict, selected = "Phone", value = "") {
  needDict.down.classList.add("down-true");
  const currContact = document.createElement("div");
  currContact.classList.add("form__contact");
  const currBar = select(dbSelect, selected);
  const currInput = document.createElement("input");
  currInput.classList.add("form__contact-input");
  currInput.value = value;

  const currCross = document.createElement("button");
  currCross.type = "button";
  currCross.classList.add("contact__cross");

  const currTooltip = document.createElement("span");
  currTooltip.classList.add("contact__tooltip");
  currTooltip.textContent = "Удалить контакт";
  currCross.appendChild(currTooltip);

  currContact.append(currBar, currInput, currCross);
  new Choices(currBar, {
    searchEnabled: false,
    itemSelectText: "",
  });
  addMaskEvent(currContact);

  currCross.addEventListener("click", () => {
    currContact.remove();
    for (let i = 0; i < needDict.currContacts.children.length; i++) {
      needDict.currContacts.children[i].setAttribute("data-id", i);
    }
    needDict.addCont.classList.add("is-active");
    if (!needDict.currContacts.children.length) {
      needDict.down.classList.remove("down-true");
    }
  });
  needDict.currContacts.append(currContact);
  for (let i = 0; i < needDict.currContacts.children.length; i++) {
    needDict.currContacts.children[i].setAttribute("data-id", i);
  }
  if (needDict.currContacts.children.length >= 10) {
    needDict.addCont.classList.remove("is-active");
  }
  return currContact;
}
