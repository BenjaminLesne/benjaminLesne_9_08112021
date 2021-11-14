import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import { ROUTES } from "../constants/routes";
import { bills } from "../fixtures/bills.js";
import firebase from "../__mocks__/firebase";
import BillsUI from "../views/BillsUI.js";

describe("Given I am connected as an employee", () => {
  // POST integration test
  describe("When I submit a new bill", () => {
    test("Then, fetches bills from mock API POST", async () => {
      const getSpy = jest.spyOn(firebase, "post");
      const newBill = bills[0];
      const allMyBills = await firebase.post(newBill);

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(allMyBills.data.length).toBe(5);
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });

  describe("When I click submit button", () => {
    test("Should display Bills page", () => {
      window.localStorage.setItem("user", '{"type":"Employee"}');

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const html = NewBillUI();
      document.body.innerHTML = html;

      const myNewBill = new NewBill({
        document,
        onNavigate,
      });

      const handleSubmit = jest.fn(() => myNewBill.handleSubmit);

      const formNewBill = screen.getByTestId("form-new-bill");
      formNewBill.addEventListener("submit", handleSubmit);

      fireEvent.submit(formNewBill);

      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });

  describe("When I add a proof of purchase file", () => {
    test("Should display proof of purchase file in input file", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const fileInput = screen.getByTestId("file");
      const myNewBill = new NewBill({
        document,
        firestore: null,
      });

      const handleChangeFile = jest.fn((e) => myNewBill.handleChangeFile);

      fileInput.addEventListener("change", handleChangeFile);
      const file = new File(["(⌐□_□)"], "chucknorris.png", {
        type: "image/png",
      });
      userEvent.upload(fileInput, file);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0].name).toBe("chucknorris.png");
    });
  });

  describe("When I am on NewBill Page", () => {
    test("Should render 8 inputs", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      //get all inputs
      const expenseNameInput = screen.getByTestId("expense-name");
      const datePickerInput = screen.getByTestId("datepicker");
      const amountInput = screen.getByTestId("amount");
      const vatInput = screen.getByTestId("vat");
      const pctInput = screen.getByTestId("pct");
      const fileInput = screen.getByTestId("file");
      const expenseTypeInput = screen.getByTestId("expense-type");
      const commentaryInput = screen.getByTestId("commentary");

      //check if they exist
      expect(expenseTypeInput).toBeTruthy();
      expect(expenseNameInput).toBeTruthy();
      expect(datePickerInput).toBeTruthy();
      expect(amountInput).toBeTruthy();
      expect(vatInput).toBeTruthy();
      expect(pctInput).toBeTruthy();
      expect(commentaryInput).toBeTruthy();
      expect(fileInput).toBeTruthy();
    });

    test("Then New bill page render", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const newBillForm = screen.getByTestId("form-new-bill");
      expect(newBillForm).toBeTruthy();
    });
  });
});
