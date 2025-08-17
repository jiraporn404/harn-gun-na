import { useGroups } from "./useGroups";

export interface Person {
  id: string;
  name: string;
  color: string;
}

interface Payment {
  payerId: string;
  amount: number;
}

// Updated to support custom sharing amounts per person
export interface SharedAmount {
  personId: string;
  amount: number;
}

export interface Expense {
  id: string;
  name: string;
  totalAmount: number;
  date: string;
  payments: Payment[];
  sharedWith: SharedAmount[]; // Changed from string[] to SharedAmount[]
}

interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export const generatePastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.random() * 20;
  const lightness = 75 + Math.random() * 15;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export function useExpenses() {
  const { currentGroup, updateCurrentGroup } = useGroups();

  const people = currentGroup?.people || [];
  const expenses = currentGroup?.expenses || [];

  const addPerson = (name: string) => {
    const newPerson = {
      id: crypto.randomUUID(),
      name,
      color: generatePastelColor(),
    };

    updateCurrentGroup((group) => ({
      ...group,
      people: [...group.people, newPerson],
    }));
  };

  const deletePerson = (id: string) => {
    updateCurrentGroup((group) => ({
      ...group,
      people: group.people.filter((person) => person.id !== id),
    }));
  };

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = {
      ...expense,
      id: crypto.randomUUID(),
    };

    updateCurrentGroup((group) => ({
      ...group,
      expenses: [...group.expenses, newExpense],
    }));
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.totalAmount,
    0
  );

  const deleteExpense = (id: string) => {
    // setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    updateCurrentGroup((group) => ({
      ...group,
      expenses: group.expenses.filter((expense) => expense.id !== id),
    }));
  };

  const editExpense = (id: string, updatedExpense: Omit<Expense, "id">) => {
    updateCurrentGroup((group) => ({
      ...group,
      expenses: group.expenses.map((expense) =>
        expense.id === id ? { ...updatedExpense, id } : expense
      ),
    }));
  };

  const calculateSharedExpenses = () => {
    const balances: Record<string, number> = {};

    // Initialize balances for all people
    people.forEach((person) => {
      balances[person.id] = 0;
    });

    // Calculate who paid what
    expenses.forEach((expense) => {
      // Add payments to payers' balances
      expense.payments.forEach((payment) => {
        balances[payment.payerId] += payment.amount;
      });

      // Subtract from shared people's balances based on their specific amounts
      expense.sharedWith.forEach((sharedAmount) => {
        balances[sharedAmount.personId] -= sharedAmount.amount;
      });
    });

    return balances;
  };

  const calculateTransactions = (): Transaction[] => {
    const balances = calculateSharedExpenses();
    const transactions: Transaction[] = [];

    // Create arrays of debtors and creditors
    const debtors = Object.entries(balances)
      .filter(([_, balance]) => balance < 0)
      .map(([id, balance]) => ({ id, balance: Math.abs(balance) }))
      .sort((a, b) => b.balance - a.balance);

    const creditors = Object.entries(balances)
      .filter(([_, balance]) => balance > 0)
      .map(([id, balance]) => ({ id, balance }))
      .sort((a, b) => b.balance - a.balance);

    // Calculate transactions
    for (const debtor of debtors) {
      let remainingDebt = debtor.balance;

      for (const creditor of creditors) {
        if (remainingDebt <= 0 || creditor.balance <= 0) continue;

        const transferAmount = Math.min(remainingDebt, creditor.balance);
        if (transferAmount > 0) {
          transactions.push({
            from: debtor.id,
            to: creditor.id,
            amount: transferAmount,
          });

          remainingDebt -= transferAmount;
          creditor.balance -= transferAmount;
        }
      }
    }

    return transactions;
  };

  const clearPeopleData = () => {
    updateCurrentGroup((group) => ({
      ...group,
      people: [],
    }));
  };

  const clearExpensesData = () => {
    // setExpenses([]);
    updateCurrentGroup((group) => ({
      ...group,
      expenses: [],
    }));
  };

  return {
    expenses,
    people,
    addExpense,
    addPerson,
    deletePerson,
    totalExpenses,
    calculateSharedExpenses,
    calculateTransactions,
    deleteExpense,
    editExpense,
    clearPeopleData,
    clearExpensesData,
  };
}
