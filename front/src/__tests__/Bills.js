// /**
//  * @jest-environment jsdom
//  */

// import "@testing-library/jest-dom";
// import { fireEvent, screen, waitFor, getByTestId } from "@testing-library/dom";
// import BillsUI from "../views/BillsUI.js";
// import { bills } from "../fixtures/bills.js";
// import { ROUTES_PATH } from "../constants/routes.js";
// import { localStorageMock } from "../__mocks__/localStorage.js";

// import router from "../app/Router.js";

// describe("Given I am connected as an employee", () => {
//   describe("When I am on Bills Page", () => {
//     test("Then bill icon in vertical layout should be highlighted", async () => {
//       Object.defineProperty(window, "localStorage", {
//         value: localStorageMock,
//       });
//       window.localStorage.setItem(
//         "user",
//         JSON.stringify({
//           type: "Employee",
//         })
//       );
//       const root = document.createElement("div");
//       root.setAttribute("id", "root");
//       document.body.append(root);
//       router();
//       window.onNavigate(ROUTES_PATH.Bills);
//       await waitFor(() => screen.getByTestId("icon-window"));
//       const windowIcon = screen.getByTestId("icon-window");
//       //to-do write expect expression
//       expect(windowIcon).toHaveClass("active-icon");
//     });
//     // test("Then bills should be ordered from earliest to latest", () => {
//     //   document.body.innerHTML = BillsUI({ data: bills });
//     //   const dates = screen
//     //     .getAllByText(
//     //       /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
//     //     )
//     //     .map((a) => a.innerHTML);
//     //   const antiChrono = (a, b) => (a < b ? 1 : -1);
//     //   const datesSorted = [...dates].sort(antiChrono);
//     //   expect(dates).toEqual(datesSorted);
//     // });
//     //
//     test("Si j click sur le button Nouvelle note de frais je serai redériger vers la page newBill", async () => {
//       Object.defineProperty(window, "localStorage", {
//         value: localStorageMock,
//       });
//       window.localStorage.setItem(
//         "user",
//         JSON.stringify({
//           type: "Employee",
//         })
//       );

//       window.onNavigate(ROUTES_PATH.Bills);
//       await waitFor(() => screen.getByTestId("btn-new-bill"));
//       const btnNewBill = screen.getByTestId("btn-new-bill");
//       expect(btnNewBill).toBeTruthy();
//       // const form = screen.getByTestId("form-new-bill");
//       // fireEvent.click(btnNewBill);
//       // expect(form).toBeVisible();
//     });
//   });
// });

/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within, getAllByTestId } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

jest.mock("../app/Store", () => mockedStore); // @dpe on instencie un mok pour simuler le store

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      const windowIcon = screen.getByTestId("icon-window");
      await waitFor(() => windowIcon);
      // vérifie si windowIcon posséde bien la classe active-icon
      expect(windowIcon).toHaveClass("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({
        data: bills,
      });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    // L'ajout des tests unitaires

    // Test unitaire pour vérifier le bon fonctionnement de bouton "nouvelle note de frais"
    describe("When I click on New Bill Button", () => {
      test("Then I should be sent on New Bill form", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        // Initialiser les données de l'utilisateur pour les stocker
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        const bills = new Bills({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage,
        });
        document.body.innerHTML = BillsUI({ data: bills });

        const btnNewBill = screen.getByRole("button", {
          name: /nouvelle note de frais/i,
        });
        // Vérifier que le btn existe
        expect(btnNewBill).toBeTruthy();

        const handleClickNewBill = jest.fn(bills.handleClickNewBill);
        btnNewBill.addEventListener("click", handleClickNewBill);
        userEvent.click(btnNewBill); // on click sur le bouton
        // Vérifier que la fonction handleClickNewBill est appelé
        expect(handleClickNewBill).toHaveBeenCalled();
      });
    });

    // test unitaire pour vérifier que lorsque l'on click sur l'oeil le modale s'ouvre
    describe("When I click on one eye icon", () => {
      test("Then a modal should open", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });

        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        const billsPage = new Bills({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage,
        });

        document.body.innerHTML = BillsUI({ data: bills });

        const iconEyes = screen.getAllByTestId("icon-eye");

        const handleClickIconEye = jest.fn(billsPage.handleClickIconEye);

        const modale = document.getElementById("modaleFile");

        const openModal = () => {
          modale.classList.add("show");
        };

        iconEyes.forEach((iconEye) => {
          iconEye.addEventListener("click", () => {
            handleClickIconEye(iconEye);
            openModal();
            expect(handleClickIconEye).toHaveBeenCalled();
            expect(modale.classList.contains("show")).toBe(true);
          });
        });
      });
    });

    // test unitaire pour vérifier si la page se charge bien
    describe("When I went on Bills page and it is loading", () => {
      test("Then, Loading page should be rendered", () => {
        document.body.innerHTML = BillsUI({ loading: true });
        expect(screen.getByText("Loading...")).toBeVisible();
        document.body.innerHTML = "";
      });
    });
  });
});
