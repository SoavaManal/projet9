// /**
//  * @jest-environment jsdom
//  */

// import { screen, fireEvent, getByTestId } from "@testing-library/dom";
// import userEvent from "@testing-library/user-event";
// import NewBillUI from "../views/NewBillUI.js";
// import NewBill from "../containers/NewBill.js";
// import { bills } from "../fixtures/bills";
// import { ROUTES_PATH } from "../constants/routes.js";
// import { localStorageMock } from "../__mocks__/localStorage.js";
// import router from "../app/Router.js";
// import mockStore from "../__mocks__/store.js";

// // je suis connécté autant qu'employée et je suis sur la page de newBill
// describe("Test de l'envoi du formulaire de notes de frais", () => {
//   test("Devrait changer de page si tous les champs requis sont bien remplis", async () => {
//     // préparer l'evironement de test : localStorage, route, views
//     Object.defineProperty(window, "localStorage", {
//       value: localStorageMock,
//     });
//     window.localStorage.setItem(
//       "user",
//       JSON.stringify({
//         type: "Employee",
//         email: "a@a",
//       })
//     );
//     const root = document.createElement("div");
//     root.setAttribute("id", "root");
//     document.body.append(root);
//     router();
//     document.body.innerHTML = NewBillUI();
//     window.onNavigate(ROUTES_PATH.NewBill);

//     console.log(JSON.parse(window.localStorage.getItem("user")));
//     const newBill = new NewBill({
//       document,
//       onNavigate: jest.fn(),
//       store: mockStore,
//       localStorage: window.localStorage,
//     });

//     const getFile = (fileName, fileType) => {
//       const file = new File(["img"], fileName, {
//         type: [fileType],
//       });

//       return file;
//     };

//     const data = bills[0];
//     const file = getFile(data.fileName, ["image/jpg"]);

//     // Remplir les champs du formulaire
//     userEvent.selectOptions(
//       getByTestId(document.body, "expense-type"),
//       data.type
//     );
//     userEvent.type(getByTestId(document.body, "expense-name"), data.name);
//     fireEvent.change(getByTestId(document.body, "datepicker"), {
//       target: { value: data.date },
//     });
//     userEvent.type(
//       getByTestId(document.body, "amount"),
//       data.amount.toString()
//     );
//     userEvent.type(getByTestId(document.body, "pct"), data.pct.toString());
//     userEvent.type(getByTestId(document.body, "vat"), data.vat);
//     userEvent.type(getByTestId(document.body, "commentary"), data.commentary);
//     await userEvent.upload(getByTestId(document.body, "file"), file);

//     newBill.fileName = file.name;

//     console.log(getByTestId(document.body, "pct").value);
//     console.log(JSON.parse(window.localStorage.getItem("user")));

//     // Soumettre le formulaire
//     const form = screen.getByTestId("form-new-bill");
//     const handleSubmit = jest.fn(NewBill.handleSubmit);

//     form.addEventListener("submit", handleSubmit);
//     // userEvent.click(getByTestId(document.body, "btn-submit"));
//     fireEvent.submit(form);

//     // Verifier le test
//     expect(handleSubmit).toHaveBeenCalled();
//     expect(jest.fn()).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
//   });
// });

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

/* grace à la fonction jest.mock 'bibliotheque jest' on remplace le store 
par mockStore qui nous permtra de simuler store avec les données que l'on souihaite 
sans devoir l'executer*/
jest.mock("../app/Store", () => mockStore);

const setNewBill = () => {
  return new NewBill({
    document,
    onNavigate,
    store: mockStore,
    localStorage: window.localStorage,
  });
};

beforeAll(() => {
  // Créé une seul fois pour tous les tests
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
});

beforeEach(() => {
  // permet a cette fonction d'être utilisé par chaque test
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();

  document.body.innerHTML = NewBillUI();

  window.onNavigate(ROUTES_PATH.NewBill);
});

afterEach(() => {
  // efface tous ce qui a été créé dans le beforeEach
  jest.resetAllMocks();
  document.body.innerHTML = "";
});

// Test unitaire: vérifie si icon on vertical posséde bien la classe active-icon
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then newBill icon in vertical layout should be highlighted", () => {
      const windowIcon = screen.getByTestId("icon-mail");

      expect(windowIcon).toHaveClass("active-icon");
    });

    // Test unitaire: envoi du formulaire
    describe("When I do fill fields in correct format and I click on submit button", () => {
      test("Then the submission process should work properly, and I should be sent on the Bills Page", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const data = bills[0];

        const form = screen.getByTestId("form-new-bill");

        const handleSubmit = jest.fn(newBill.handleSubmit);

        const file = getFile(data.fileName, ["image/jpg"]);

        // On remplit les champs
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

        const submitButton = screen.getByRole("button", { name: /envoyer/i });

        // On soumet le formulaire
        form.addEventListener("submit", handleSubmit);
        userEvent.click(submitButton);

        expect(handleSubmit).toHaveBeenCalled();

        // On s'assure qu'on est bien renvoyé sur la page Bills
        // expect(screen.getByText(/Mes notes de frais/i)).toBeVisible();
        //expect(jest.fn()).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
        const notesDeFrais = screen.getByText(/Mes notes de frais/i);
        expect(notesDeFrais).toHaveStyle({ visibility: "visible" });
      });
    });

    // Champs non remplis

    describe("When I do not fill fields and I click on submit button", () => {
      test("Then it should stay on newBill page", () => {
        const newBill = setNewBill();

        const form = screen.getByTestId("form-new-bill");

        const handleSubmit = jest.spyOn(newBill, "handleSubmit");

        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);

        expect(handleSubmit).toHaveBeenCalledTimes(1);

        expect(form).toBeVisible();
      });
    });
  });
});

// UTILS
const getFile = (fileName, fileType) => {
  const file = new File(["img"], fileName, {
    type: [fileType],
  });

  return file;
};
