import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {

  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();
  const list = {
    transactions: transactions,
    balance: balance
  }
  return response.json(list);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const dados = {
    title,
    value,
    type,
    category
  }

  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute(dados);
  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);
  return response.status(204).send();
});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  const importTransactionsService = new ImportTransactionsService();
  const { file } = request;
  const transactions = await importTransactionsService.execute(file.filename)
  return response.json(transactions);
});

export default transactionsRouter;
