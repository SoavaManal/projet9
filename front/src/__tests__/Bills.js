/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

// On instencie un mok pour simuler le store
jest.mock("../app/Store", () => mockedStore);

// Employee Test: sur la page Bills
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

    /* Les notes deverait etre listé par ordre */
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
    /* Ajouter des tests unitaires */

    // Test unitaire pour vérifier le bon fonctionnement de bouton "nouvelle note de frais"
    describe("When I click on New Bill Button", () => {
      test("Then I should be sent on New Bill form", () => {
        // Permet de simuler la navigation vers une nouvelle URL en mettant à jour le contenu HTML
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        /* on définie la propriété localStorage de l'objet window pour
        utilisé une instance de stockage local "localStorageMock" pour les test */
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        // initialiser les données de l'utilisateur pour les stocker
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        // Créer une instance de Objet Bills
        const bills = new Bills({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage,
        });
        // On charge les données
        document.body.innerHTML = BillsUI({ data: bills });

        // Récupérer l'élèment bouton de la DOM
        const btnNewBill = screen.getByRole("button", {
          name: /nouvelle note de frais/i,
        });
        // vérifier que le bouton pour créer une nouvel note existe
        expect(btnNewBill).toBeTruthy();

        // créer une fonction mock
        const handleClickNewBill = jest.fn(bills.handleClickNewBill);
        btnNewBill.addEventListener("click", handleClickNewBill);
        // on click sur le bouton
        userEvent.click(btnNewBill);

        // vérifier que la fonction handleClickNewBill est appelé
        expect(handleClickNewBill).toHaveBeenCalled();
      });
    });

    // Test unitaire pour vérifier que lorsque l'on click sur l'icons-eye le modale s'ouvre
    describe("When I click on one eye icon", () => {
      test("Then a modal should open", async () => {
        /* on définie la propriété localStorage de l'objet window pour
        utilisé une instance de stockage local "localStorageMock" pour les test */
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });

        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        // Créer une instance de l'objet Bills
        const billsPage = new Bills({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage,
        });
        // On charge les données
        document.body.innerHTML = BillsUI({ data: bills });

        const iconEyes = screen.getAllByTestId("icon-eye"); // récupérer l'élèment de la DOM
        const handleClickIconEye = jest.fn(billsPage.handleClickIconEye); // créer une fonction mock

        const modale = document.getElementById("modaleFile");

        $.fn.modal = jest.fn(() => modale.classList.add("show"));

        iconEyes.forEach((iconEye) => {
          iconEye.addEventListener("click", () => {
            handleClickIconEye(iconEye);
          });
          userEvent.click(iconEye);
          // verification du bon fonctionel :
          // *la fonction handleClickIconEye soit appelé
          // *la classe show soit associer a l'element modale
          expect(handleClickIconEye).toHaveBeenCalled();
          expect(modale.classList.contains("show")).toBe(true);
        });
      });
    });

    // Test d'intégration GET
    describe("Given I am a user connected as Employee", () => {
      describe("When I navigate to Bills", () => {
        test("fetches bills from mock API GET", async () => {
          // Permet de surveiller les appels de la méthode bills de l'objet mockedStore
          jest.spyOn(mockedStore, "bills");
          /* on définie la propriété localStorage de l'objet window pour
        utilisé une instance de stockage local "localStorageMock" pour les test */
          Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
          });
          localStorage.setItem(
            "user",
            JSON.stringify({ type: "Employee", email: "a@a" })
          );

          const root = document.createElement("div");
          root.setAttribute("id", "root");
          document.body.append(root);
          router();
          window.onNavigate(ROUTES_PATH.Bills);
          const billsTable = screen.getByTestId("tbody");
          await waitFor(() => screen.getByText("Mes notes de frais"));
          const newBillBtn = await screen.getByRole("button");
          expect(newBillBtn).toBeTruthy(); // on vérifie l'existence d'un bouton "nouvelle note de frais"

          expect(billsTable).toBeTruthy(); // on vérifie l'existence d'un tableau de factures
          expect(within(billsTable).getAllByRole("row")).toHaveLength(4); // On vérifie que le tableau contient 4 éléments
        });
        describe("When an error occurs on API", () => {
          beforeEach(() => {
            jest.spyOn(mockedStore, "bills");
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
            document.body.appendChild(root);
            router();
          });
          // erreur 404
          test("fetches bills from an API and fails with 404 message error", async () => {
            mockedStore.bills.mockImplementationOnce(() => {
              return {
                list: () => {
                  return Promise.reject(new Error("Erreur 404"));
                },
              };
            });
            window.onNavigate(ROUTES_PATH.Bills);
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 404/);
            expect(message).toBeTruthy();
          });
          // erreur 500
          test("fetches messages from an API and fails with 500 message error", async () => {
            mockedStore.bills.mockImplementationOnce(() => {
              return {
                list: () => {
                  return Promise.reject(new Error("Erreur 500"));
                },
              };
            });

            window.onNavigate(ROUTES_PATH.Bills);
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 500/);
            expect(message).toBeTruthy();
          });
        });
      });
    });

    // Test unitaire pour vérifier si la page se charge bien
    describe("When I went on Bills page and it is loading", () => {
      test("Then, Loading page should be rendered", () => {
        document.body.innerHTML = BillsUI({ loading: true });

        expect(screen.getByText("Loading...")).toBeVisible();
        // On vide le contenu pour eviter les effets de bord dans le prochain test
        document.body.innerHTML = "";
      });
    });
  });
});
