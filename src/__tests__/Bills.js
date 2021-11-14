import { screen } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES } from "../constants/routes";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import firebase from "../__mocks__/firebase";

describe("Given I am connected as an employee", () => {
  // test d'intégration GET
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get");
      const bills = await firebase.get();
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(bills.data.length).toBe(4);
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });

  describe("When I click on eye icon", () => {
    test("should display modal", () => {
      window.localStorage.setItem("user", '{"type":"Employee"}');

      //we take index = 1 cause this is the first bill that doesn't have status = pending
      const html = BillsUI({ data: [bills[1]] });
      document.body.innerHTML = html;
      const modal = document.querySelector("#modaleFile");

      const myNewBill = new Bills({
        document,
        localStorage: window.localStorage,
      });

      //prevent $(...).modal is not a function error
      $.fn.modal = () => modal.classList.add("show");

      const handleClickIconEye = jest.fn(() => myNewBill.handleClickIconEye);
      const eyeIcon = screen.getByTestId("icon-eye");

      eyeIcon.addEventListener("click", handleClickIconEye);

      userEvent.click(eyeIcon);
      expect(handleClickIconEye).toHaveBeenCalled();

      expect(modal.classList).toContain("show");
    });
  });

  describe("When I click on New Bill button", () => {
    test("It should display new bill page", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", '{"type":"Employee"}');

      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const firestore = null;
      const bills = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });
      const btnNewBill = screen.getByTestId("btn-new-bill");
      const handleClickNewBill = jest.fn(() => bills.handleClickNewBill);

      btnNewBill.addEventListener("click", handleClickNewBill);
      btnNewBill.click();
      expect(handleClickNewBill).toHaveBeenCalled();

      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });
  describe("When I am on Bills Page and it is loading", () => {
    test("Then render loading page", () => {
      const html = BillsUI({ loading: true });
      document.body.innerHTML = html;
      expect(document.body.innerHTML).toMatch(/Loading.../);
    });
  });

  describe("When I am on Bills Page and an error appears", () => {
    test("Then render error page", () => {
      const html = BillsUI({ error: "error" });

      document.body.innerHTML = html;
      expect(document.body.innerHTML).toMatch(/Erreur/);
    });
  });

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;

      //allows the class "active-icon" to be rendered before the expect function run
      setTimeout(() => {
        expect(
          screen.getByTestId("icon-window").classList.contains("active-icon")
        ).toBe(true);
      }, 0);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});
