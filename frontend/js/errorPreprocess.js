import { createFirst } from "./createReqs.js";
import { addErrorText } from "./validate.js";
import { restartSpin } from "./table.js";

export function checkIfErrors(dict) {
  switch (dict.req.status) {
    case 200:
    case 201:
      dict.back.classList.remove("is-active");
      createFirst();
      break;
    case 404:
    case 422:
    case 500:
      addErrorText(dict.form, createErrorsMess(dict.errors, dict.req.status));
      restartSpin(dict.spin.someButton, dict.spin.title, true);
      break;
    default:
      addErrorText(dict.form, createErrorsMess(dict.errors));
      restartSpin(dict.spin.someButton, dict.spin.title, true);
  }
}

function createErrorsMess(errors, status = "") {
  let array;

  if (errors.errors) {
    array = errors.errors.map((e) => e.message);
  } else if (errors.message) {
    array = [errors.message];
  }
  if (!array) {
    array = ["Что-то пошло не так..."];
  }
  if (status) {
    array[0] = `${status}. ${array[0]}`;
  }
  return array;
}
