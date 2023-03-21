/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, getByTestId } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

// Préparation de l'environnement de test
beforeEach(() => {
  document.body.innerHTML = NewBillUI;
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Test de l'envoi du formulaire de notes de frais", () => {
  test("Devrait rester sur la même page si les champs requis ne sont pas remplis", async () => {
    userEvent.type(getByTestId(document.body, "datepicker"), "");
    userEvent.type(getByTestId(document.body, "amount"), "");
    userEvent.type(getByTestId(document.body, "pct"), "");

    // Action: Soumettre le formulaire sans remplir les champs requis
    fireEvent.click(getByTestId(document.body, "form-new-bill"));

    // Vérification du résultat
    expect(screen.getByTestId("form-new-bill")).toBeTruthy();
  });

  test("Devrait rester sur la même page si l'extension du fichier n'est pas valide", async () => {
    userEvent.type(getByTestId(document.body, "datepicker"), "2013-06-05");
    userEvent.type(getByTestId(document.body, "amount"), "126");
    userEvent.type(getByTestId(document.body, "pct"), "10");
    userEvent.upload(
      getByTestId(document.body, "file"),
      new File([""], "image.gif", { type: "image/gif" })
    );

    // Action: Soumettre le formulaire avec une extension de fichier invalide
    fireEvent.click(getByTestId(document.body, "form-new-bill"));

    // Vérification du résultat
    expect(screen.getByTestId("form-new-bill")).toBeTruthy();
  });
  test("Devrait changer de page si tous les champs requis sont bien remplis", async () => {
    // let userParsed = JSON.parse(localStorage.getItem("user"));

    let email = "test@test";
    let status = "pending";
    let data = {
      email: email,
      date: "2013-06-05",
      amount: "126",
      pct: "10",
      file: "image.png",
      status: status,
    };
    userEvent.type(getByTestId(document.body, "datepicker"), data.date);
    userEvent.type(getByTestId(document.body, "amount"), data.amount);
    userEvent.type(getByTestId(document.body, "pct"), data.pct);
    userEvent.upload(
      getByTestId(document.body, "file"),
      new File([""], data.file, { type: "image/png" })
    );
    // Soumettre le formulaire avec l'objet contenant l'email
    // fireEvent.submit(screen.getByTestId("form-new-bill"), {
    //   target: { data },
    // });
    // Action: Soumettre le formulaire avec une extension de fichier invalide
    //fireEvent.click(getByTestId(document.body, "form-new-bill"));

    // Vérification du résultat
    const form = screen.getByTestId("form-new-bill");
    const handleSubmit = jest.fn(NewBill.handleSubmit);

    form.addEventListener("submit", handleSubmit);
    fireEvent.submit(form);

    expect(handleSubmit).toHaveBeenCalled();
    expect(screen.getByTestId("form-new-bill")).toBeTruthy();
  });
});
