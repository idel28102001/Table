export function validName(elem) {
  const input = elem.querySelector("input");
  const result = input.value.trim();
  const label = elem.querySelector("label");
  switch (input.getAttribute("data-validate-field")) {
    case "nameNotReq":
      if (!result) return;
    case "name":
      let resReturn;
      if (!result) {
        resReturn = `Поле "${label.textContent}" должно быть заполненным`;
      }
      if (!/^[a-zа-я]*$/i.test(result)) {
        resReturn = `В поле "${label.textContent}" присутсвуют некорректные символы`;
      }
      if (resReturn) {
        addDanger(input);
        return resReturn;
      }
  }
}

export function validAllFields(form, currContacts) {
  const errorStorage = checkErrors(form, currContacts);
  addErrorText(form, errorStorage);
  return !errorStorage.length;
}

function checkErrors(form, currContacts) {
  const errorStorage = [];
  form.querySelectorAll(".form__span").forEach((e) => {
    const currRes = validName(e);
    !currRes || errorStorage.push(currRes);
  });

  Array.from(currContacts.children).forEach((e) => {
    const result = validContacts(e);
    !result || errorStorage.push(result);
  });
  return errorStorage;
}

export function validContacts(elem) {
  const input = elem.querySelector("input");
  const result = input.value.trim();
  const label = elem.getAttribute("data-value");
  let resReturn;
  let valid;
  switch (label) {
    case "Phone":
      valid = validatePhone(unmaskPhone(result));
      resReturn = !!valid ? undefined : "Телефон написан не полностью";
      break;
    case "Email":
      valid = validateEmail(result);
      resReturn = !!valid ? undefined : "Некорректный E-mail";
      break;
    default:
      resReturn = !!result ? undefined : "Поле должно быть заполненно";
  }
  if (resReturn) {
    addDanger(input);
    return resReturn;
  }
}

function addDanger(input) {
  input.classList.add("danger");
  input.addEventListener("input", (e) => {
    e.currentTarget.classList.remove("danger");
  });
}

function validateEmail(email) {
  const emailRegex =
    /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /\d{10}$/;
  return phoneRegex.test(phone);
}

export function unmaskPhone(elem) {
  return elem.replace(/[\ \_\-\(\)]/g, "").replace("+7", "");
}

export function addErrorText(elem, array) {
  const oldMess = elem.querySelector(".danger-message");
  if (oldMess) {
    oldMess.remove();
  }
  if (array.length) {
    const elems = document.createElement("span");
    elems.classList.add("danger-message");
    elems.textContent = "Ошибка: ";
    array.forEach((e) => {
      elems.textContent += `${e}. `;
    });
    insertBefore(elem.querySelector(".form__sumbit"), elems);
  }
}

export function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

export function insertBefore(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode);
}
