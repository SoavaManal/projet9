/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, getByTestId } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { bills } from "../fixtures/bills";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store.js";

// je suis connécté autant qu'employée et je suis sur la page de newBill
describe("Test de l'envoi du formulaire de notes de frais", () => {
  test("Devrait changer de page si tous les champs requis sont bien remplis", async () => {
    // préparer l'evironement de test : localStorage, route, views
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "a@a",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    document.body.innerHTML = NewBillUI();
    window.onNavigate(ROUTES_PATH.NewBill);

    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    const getFile = (fileName, fileType) => {
      const file = new File(["img"], fileName, {
        type: [fileType],
      });

      return file;
    };

    const data = bills[0];
    const file = getFile(data.fileName, ["image/jpg"]);

    // Remplir les champs du formulaire
    userEvent.selectOptions(
      getByTestId(document.body, "expense-type"),
      data.type
    );
    userEvent.type(getByTestId(document.body, "expense-name"), data.name);
    fireEvent.change(getByTestId(document.body, "datepicker"), {
      target: { value: data.date },
    });
    userEvent.type(
      getByTestId(document.body, "amount"),
      data.amount.toString()
    );
    userEvent.type(getByTestId(document.body, "pct"), data.pct.toString());
    userEvent.type(getByTestId(document.body, "vat"), data.vat);
    userEvent.type(getByTestId(document.body, "commentary"), data.commentary);
    await userEvent.upload(getByTestId(document.body, "file"), file);

    newBill.fileName = file.name;

    console.log(getByTestId(document.body, "pct").value);
    console.log(JSON.parse(window.localStorage.getItem("user")));

    // Soumettre le formulaire
    const form = screen.getByTestId("form-new-bill");
    const handleSubmit = jest.fn(NewBill.handleSubmit);

    form.addEventListener("submit", handleSubmit);
    userEvent.click(getByTestId(document.body, "btn-submit"));

    // Verifier le test
    expect(handleSubmit).toHaveBeenCalled();

    expect();
  });
});
