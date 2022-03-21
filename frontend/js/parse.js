export function parseForm(form) {
  const up = form.querySelector(".form__up");
  const down = form.querySelector(".form__down");
  const resDict = {};
  resDict.contacts = [];
  up.querySelectorAll("input").forEach((e) => {
    const result = parseName(e);
    !!result ? (resDict[result[1]] = result[0]) : "";
  });
  down.querySelectorAll(".form__contact").forEach((e) => {
    resDict.contacts.push(parseContact(e));
  });
  return resDict;
}

function parseName(elem) {
  const result = elem.value.trim();
  if (result) {
    return [result, elem.getAttribute("data-name")];
  }
}

function parseContact(elem) {
  const currDict = {};
  currDict.type = elem.getAttribute("data-value");
  currDict.value = elem.querySelector("input").value;
  return currDict;
}
