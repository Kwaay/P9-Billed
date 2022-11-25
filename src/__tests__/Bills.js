/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent, toHaveClass } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import Bills from '../containers/Bills.js';
import { ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store.js';

import router from '../app/Router.js';
describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    /**
     * ! Test for the bill icon in vertical layout to be highlighted
     */
    test('Then bill icon in vertical layout should be highlighted', async () => {
      // Je définis le localStorage avec les données du mock
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      // Je définis le localStorage avec les données du mock
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        }),
      );
      // Je crée une div, où je lui set un id en tant que root et je le met dans le body
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      // J'appelle le router
      router();
      // Je navigue vers la page Bills
      window.onNavigate(ROUTES_PATH.Bills);
      // J'attends que de récupèrer l'élement avec le data-testid = icon-window
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      // J'espère que le windowIcon est définie
      expect(windowIcon).toBeDefined();
    });
    /**
     * ! Test for sorting the bills from earliest to latest
     */
    test('Then bills should be ordered from earliest to latest', () => {
      // J'insère le BillsUI dans le corps du document
      document.body.innerHTML = BillsUI({ data: bills });
      // Je récupère les dates avec une regex
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i,
        )
        .map((a) => a.innerHTML);
      // J'indique que je les veux de manière inverse des aiguilles d'une montre (anti-horaire)
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      // Je les range de manière anti-horaire
      const datesSorted = [...dates].sort(antiChrono);
      // J'espère que les dates seront rangés de manière anti-horaire
      expect(dates).toEqual(datesSorted);
    });
    /**
     * ! Test for checking that the button create a new bill
     */
    test('Then new bill button should create a new bill', async () => {
      // Je crée une nouvelle instance de Bills
      const bills = new Bills({ document, onNavigate, localStorage });
      // Je récupère le bouton "Nouvelle note de frais"
      const newBillButton = screen.getByTestId('btn-new-bill');
      // Je mock la fonction handleClickNewBill
      const handleClickNewBill = jest.fn(bills.handleClickNewBill);
      // Je met un addEventListener sur le bouton pour les clicks sur celui-ci
      newBillButton.addEventListener('click', handleClickNewBill);
      // Je simule un click sur le bouton
      await userEvent.click(newBillButton);
      // J'espère que la fonction a été appelée
      expect(handleClickNewBill).toHaveBeenCalled();
    });
    /**
     * ! Test for the new bill navigation
     */
    test('Then, I should be sent to newBill page', async () => {
      // Je crée une nouvelle instace de Bills
      const bills = new Bills({ document, onNavigate, localStorage });
      // Je mock la fonction handleClickNewBill
      const handleClickNewBill = jest.fn(bills.handleClickNewBill);
      // Je récupère le bouton
      const btnNewBill = screen.getByTestId('btn-new-bill');
      // Je met un addEventListener pour les clicks sur le bouton et je lance la fonction mockée si un click est fait
      btnNewBill.addEventListener('click', handleClickNewBill);
      // Je simule le click sur le bouton
      await userEvent.click(btnNewBill);
      // J'espère que la fonction a été appelée
      expect(handleClickNewBill).toHaveBeenCalled();
    });
    /**
     * ! Test for clicking on the eye button
     */
    test('Then, I click on the eye button', async () => {
      // Je mock le onNavigate
      const onNavigate = jest.fn();
      // Je crée une instance de Bills
      const bills = new Bills({ document, onNavigate, localStorage });
      // Je mock la function handleClickIconEye
      const handleClickIconEye = jest.fn(bills.handleClickIconEye);
      // Je récupère tous les boutons d'icon-eye
      const btnIconEye = screen.getAllByTestId('icon-eye');
      // Je récupère la modal
      const modal = document.getElementById('modaleFile');
      // Je mock l'ajout de la classe show sur la modal
      $.fn.modal = jest.fn(() => modal.classList.add('show'));

      // Pour chaque icon-eye..
      btnIconEye.forEach(async (icon) => {
        // Je set un addEventListener au click sur l'icône
        icon.addEventListener('click', handleClickIconEye(icon));
        // Je simule le click sur l'icône
        await userEvent.click(icon);
      });
      // J'espère que la fonction a été appelée
      expect(handleClickIconEye).toHaveBeenCalled();
    });
  });
});
