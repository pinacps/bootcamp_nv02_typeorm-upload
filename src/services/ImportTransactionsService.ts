import { getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import path from 'path';
import fs from 'fs';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import CreateTransactionService from './CreateTransactionService';

interface CsvData {
  title: string,
  type: 'income' | 'outcome',
  value: number,
  category: string
}

class ImportTransactionsService {

  private LoadCSV = async (fullFileName: string) => {

    const readCSVStream = fs.createReadStream(fullFileName);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const categoriesArray: string[] = [];
    const transactionsArray: CsvData[] = [];

    const dados: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) => cell.trim());
      if (!title || !type || !value || !category) return;
      categoriesArray.push(category);
      transactionsArray.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return {
      categoriesArray,
      transactionsArray
    }
  }

  async execute(fileName: string): Promise<Transaction[]> {


    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);

    // tratamento do arquivo CSV
    const fullFileName = path.resolve(__dirname, '..', '..', 'tmp', fileName);
    const { categoriesArray, transactionsArray } = await this.LoadCSV(fullFileName);

    const existentCategories = await categoryRepository.find({
      where: {
        title: In(categoriesArray)
      }
    });

    // tratamento das categorias e inclusao das novas
    const existentCategoriesTitle = await existentCategories.map(category => category.title);

    const addCategoryTitles = categoriesArray
      .filter(category => !existentCategoriesTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) == index);

    const newCategories = categoryRepository.create(
      addCategoryTitles.map(title => ({
        title
      })
      )
    );

    await categoryRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories ];

    // tratamento das transacoes
    const createdTransactions = transactionRepository.create(
      transactionsArray.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(f => f.title == transaction.category),
      })
    ));

    await transactionRepository.save(createdTransactions);

    return createdTransactions;

  }

}

export default ImportTransactionsService;
