import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import CreateCategoryService from '../services/CreateCategoryService';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string,
  value: number,
  type: 'income' | 'outcome',
  category: string
}

class CreateTransactionService {

  public async execute({ title, value, type, category }: Request): Promise<Transaction> {

    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    if (type == 'outcome') {
      const { total } = await transactionRepository.getBalance();
      if (value > total) {
        throw new AppError('Saldo indisponivel', 400);
      }
    }

    let categoryData = await categoryRepository.findOne({
      title: category
    });

    if (!categoryData) {
      const createCategoryService = new CreateCategoryService();
      categoryData = await createCategoryService.execute({ title: category });
    };

    const dados = {
      title,
      value,
      type,
      category: categoryData
    }

    const repository = transactionRepository.create(dados);

    await transactionRepository.save(repository);

    return repository;

  }
}

export default CreateTransactionService;
