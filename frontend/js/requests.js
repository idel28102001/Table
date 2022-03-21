const mainHref = "http://localhost:3000/api/clients";

export function getList(search = null) {
  let newHref;
  if (search) {
    newHref = `${mainHref}?search=${search}`;
  } else {
    newHref = mainHref;
  }
  return fetch(newHref)
    .then((e) => {
      return e.json();
    })
    .catch((e) => {
      throw e;
    });
}

export function postElem(dict) {
  return fetch(mainHref, {
    method: "POST",
    body: JSON.stringify(dict),
    headers: {
      "Content-Type": "application-json",
    },
  });
}

export function deleteElem(id) {
  return fetch(`${mainHref}/${id}`, {
    method: "DELETE",
  });
}

export function patchElem(dict, id) {
  return fetch(`${mainHref}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dict),
    headers: {
      "Content-Type": "application-json",
    },
  });
}
