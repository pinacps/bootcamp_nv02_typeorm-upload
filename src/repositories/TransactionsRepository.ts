import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {

  public async getBalance(): Promise<Balance> {

    const transactions = await this.find();

    const income = await transactions
      .filter(f => f.type == 'income')
      .reduce((acumulator, transaction) => {
        return Number(acumulator) + Number(transaction.value);
      }, 0);

    const outcome = await transactions
      .filter(f => f.type == 'outcome')
      .reduce((acumulator, transaction) => {
        return Number(acumulator) + Number(transaction.value);
      }, 0);

    return {
      income,
      outcome,
      total: income - outcome
    }

  }

}

export default TransactionsRepository;
