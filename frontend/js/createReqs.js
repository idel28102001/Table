import { sortRows, createEmpty } from "./table.js";
import { getList } from "./requests.js";

export const bodyTable = document.querySelector(".table__body");

export function createFirst(search = null) {
  const searchField = document.querySelector(".header__input");
  const btnAdd = document.querySelector(".contacts__button-add");
  searchField.setAttribute("disabled", true);
  btnAdd.setAttribute("disabled", true);

  bodyTable.innerHTML = "";
  createEmpty(bodyTable);
  getList(search)
    .then((e) => {
      searchField.removeAttribute("disabled");
      btnAdd.removeAttribute("disabled");
      sortRows(document.querySelectorAll(".table__button"), bodyTable, e);
    })
    .catch((e) => {
      const danger = document.createElement("span");
      danger.classList.add("danger-server");
      danger.textContent = "Ошибка 500: Сервер не работает";
      const selec = bodyTable.querySelector(".main-empty");
      selec.innerHTML = "";
      selec.append(danger);
    });
}
