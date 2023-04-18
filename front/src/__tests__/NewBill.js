/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, getByTestId } from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";

// Remplacer le store par le mockStore
jest.mock("../app/Store", () => mockStore);

beforeEach(() => {
  /* on définie la propriété localStorage de l'objet window pour 
        utilisé une instance de stockage local "localStorageMock" pour les test*/
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  // initialisé et stocké les données d'utilisateur
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "a@a",
    })
  );
  // créer un élèment di et l'ajouter au body
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();

  // Oncharge les données
  document.body.innerHTML = NewBillUI();
  window.onNavigate(ROUTES_PATH.NewBill);
});
afterEach(() => {
  /* Réinitialisé tous les mocks pour assuré que chaque
   test s'éxécute dans un état isolé et un environement propre */
  jest.resetAllMocks();
  // déchargé les données
  document.body.innerHTML = "";
});

// Test unitaire: verifier qu icons est active
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // testée unitaire: si l'icons a droite est actif
    test("Then newBill icon in vertical layout should be highlighted", () => {
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon).toHaveClass("active-icon");
    });

    // Test d'integration: POST envoi du formulaire
    describe("When I submit fields in correct format ", () => {
      test("Then I should be sent on the Bills Page", async () => {
        // on définie la fonction onNavigate pour charger les données de la page
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // créer une instance de l'objet NewBill
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
        userEvent.type(
          getByTestId(document.body, "commentary"),
          data.commentary
        );
        await userEvent.upload(getByTestId(document.body, "file"), file);

        newBill.fileName = file.name;

        // Soumettre le formulaire
        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn(NewBill.handleSubmit);

        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);

        // Verifier le test
        expect(handleSubmit).toHaveBeenCalled();
        // await waitFor(() => screen.getByText("Mes notes de frais"));
        const notesDeFrais = screen.getByText("Mes notes de frais");
        expect(notesDeFrais).toHaveStyle({ visibility: "visible" });
      });
    });
    describe("When I click submit form without filling in the fields", () => {
      test("Then i should be stay on page NewBill", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn(NewBill.handleSubmit);

        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        expect(form).toBeVisible();
      });
    });

    // Test unitaire: verrifier le format du fichier
    describe("When I upload a file with bad extension", () => {
      test("Then an error message be displayed", () => {
        const handleChangeFile = jest.fn(NewBill.handleChangeFile);
        const image = screen.getByTestId("file");

        image.addEventListener("change", handleChangeFile);

        fireEvent.change(image, {
          target: {
            files: [
              new File(["document"], "document.pdf", {
                type: "application/pdf",
              }),
            ],
          },
        });

        expect(handleChangeFile).toHaveBeenCalledTimes(1);
        expect(
          screen.getByText(
            "Attention! seul les formats jpeg jpg et png sont accéptés"
          )
        ).toBeVisible();
      });
    });
  });
});
