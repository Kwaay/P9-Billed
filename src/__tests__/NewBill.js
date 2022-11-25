/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { fireEvent, screen } from '@testing-library/dom';
import store from '../__mocks__/store.js';

// Je mock le onNavigate
const onNavigate = jest.fn();
// Je mock un message d'erreur
window.alert = jest.fn();
// Je définis le localStorage avec les données du mock
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
// Je set l'item 'user' en tant qu'employé
window.localStorage.setItem(
  'user',
  JSON.stringify({
    type: 'Employee',
  }),
);

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    /**
     * ! Test for the page render
     */
    test('Then the page should be rendered correctly', () => {
      // J'insère le NewBillUI dans le corps du document
      document.body.innerHTML = NewBillUI();
      // Je récupère le bouton "Envoyer une note de frais"
      const newBillBtn = screen.getByText('Envoyer une note de frais');
      // Je récupère le bouton "Envoyer"
      const sendBtn = screen.getByText('Envoyer');
      // Je récupère le formulaire
      const form = document.querySelector('form');
      // J'espère que le bouton "Envoyer une note de frais" sera défini
      expect(newBillBtn).toBeDefined();
      // J'espère que le bouton "Envoyer" sera défini
      expect(sendBtn).toBeDefined();
      // J'espère que le formulaire aura une longueur de 9
      expect(form).toHaveLength(9);
    });
    /**
     * ! Test for the upload on the image with a great extension
     */
    test('Then i want to upload a image file with a great extension', () => {
      // J'insère le NewBillUI dans le corps du document
      document.body.innerHTML = NewBillUI();
      // Je crée une instance de NewBill
      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      // Je récupère le bouton d'envoi du fichier
      const fileUploadBtn = screen.getByTestId('file');
      // Je mock la fonction handleChangeFile
      const handleChangeFile = jest.fn(newBillInstance.handleChangeFile);
      // Je set un addEventListener sur le mock de la fonction handleChangeFile pour les changements
      fileUploadBtn.addEventListener('change', handleChangeFile);
      // Crée un évenement "change" avec un faux fichier de test
      fireEvent.change(fileUploadBtn, {
        target: {
          files: [new File(['content'], 'imgtest.jpg', { type: 'image/jpg' })],
        },
      });
      // Récupère le nombre de fichiers
      const fileNumber = fileUploadBtn.files.length;
      // J'espère que la fonction handleChangeFile sera appelée
      expect(handleChangeFile).toHaveBeenCalled();
      // J'espère que le nombre de fichiers soit supérieur à 0
      expect(fileNumber).toBeGreaterThan(0);
      // J'espère  que le nombre de fichiers soit inférieur à 2
      expect(fileNumber).toBeLessThan(2);
      // J'espère que le nom du fichier sera imgtest.jpg
      expect(fileUploadBtn.files[0].name).toBe('imgtest.jpg');
      // J'espère que la valeur du bouton d'upload de fichier ne soit pas null
      expect(fileUploadBtn.value).not.toBeNull();
    });
    /**
     * ! Test for the upload on the image with a bad extension
     */
    test('Then i want to upload a image file with a bad extension', () => {
      // J'insère le NewBillUI dans le corps du document
      document.body.innerHTML = NewBillUI();
      // Je crée une instance de NewBill
      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      // Je récupère le bouton d'envoi du fichier
      const fileUploadBtn = screen.getByTestId('file');
      // Je mock la fonction handleChangeFile
      const handleChangeFile = jest.fn(newBillInstance.handleChangeFile);
      // Je set un addEventListener sur le mock de la fonction handleChangeFile pour les changements
      fileUploadBtn.addEventListener('change', handleChangeFile);
      // Crée un évenement "change" avec un faux fichier de test
      fireEvent.change(fileUploadBtn, {
        target: {
          files: [new File(['content'], 'imgtest.gif', { type: 'image/gif' })],
        },
      });
      // Récupère le nombre de fichiers
      const fileNumber = fileUploadBtn.files.length;
      // J'espère que la fonction handleChangeFile sera appelée
      expect(handleChangeFile).toHaveBeenCalled();
      // J'espère que le nombre de fichiers soit supérieur à 0
      expect(fileNumber).toBeGreaterThan(0);
      // J'espère  que le nombre de fichiers soit inférieur à 2
      expect(fileNumber).toBeLessThan(2);
      // J'espère que le nom du fichier sera imgtest.gif
      expect(fileUploadBtn.files[0].name).toBe('imgtest.gif');
    });
  });
  describe('When I submit a new valid bill', () => {
    /**
     * ! POST Test
     */
    test('Then a new bill should be created', () => {
      // J'insère le NewBillUI dans le corps du document
      document.body.innerHTML = NewBillUI();
      // Je récupère le formulaire de création de Bills
      const newBillForm = screen.getByTestId('form-new-bill');
      // Je crée une instance de NewBill
      const newBillInstance = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      // Je mock la function handleSubmit
      const handleSubmit = jest.fn(newBillInstance.handleSubmit);
      newBillForm.addEventListener('submit', handleSubmit);
      // Je définis une Bills valide pour une création
      const newBillValid = {
        name: 'BillTest',
        type: 'Hôtel et logement',
        date: '2022-11-25',
        fileUrl: 'https://localhost:3456/images/imgtest.jpg',
        fileName: 'imgtest.jpg',
        amount: 123,
        vat: 456,
        pct: 789,
      };
      // Object destructuring for the newBillValid object
      const {
        type,
        name,
        date,
        amount,
        vat,
        pct,
        commentary,
        fileUrl,
        fileName,
      } = newBillValid;
      // Récupération de tous les champs et set de leur valeur avec les données de test
      document.querySelector(`select[data-testid="expense-type"]`).value = type;
      document.querySelector(`input[data-testid="expense-name"]`).value = name;
      document.querySelector(`input[data-testid="datepicker"]`).value = date;
      document.querySelector(`input[data-testid="amount"]`).value = amount;
      document.querySelector(`input[data-testid="vat"]`).value = vat;
      document.querySelector(`input[data-testid="pct"]`).value = pct;
      document.querySelector(`textarea[data-testid="commentary"]`).value =
        commentary;
      newBillInstance.fileUrl = fileUrl;
      newBillInstance.fileName = fileName;
      // Créer un évenement de submit pour le form
      fireEvent.submit(newBillForm);
      // J'espère que la fonction handleSubmit sera appelé
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
