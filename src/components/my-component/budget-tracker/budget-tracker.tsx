import { Component, State, h } from '@stencil/core';
import { StorageService } from '../../../Services/storage-service';

@Component({
  tag: 'budget-tracker',
  styleUrl: 'budget-tracker.css',
  shadow: true,
})
export class BudgetTracker {
  @State() expenses: { name: string; amount: number }[] = [];
  @State() newExpenseName: string = '';
  @State() newExpenseAmount: number = 0;

  componentWillLoad() {
    //! Load saved budget data from localStorage
    const savedExpenses = StorageService.loadBudget();
    if (savedExpenses.length > 0) {
      this.expenses = savedExpenses;
    }
  }

  handleAddExpense() {
    if (this.newExpenseName.trim() && this.newExpenseAmount > 0) {
      const updatedExpenses = [
        ...this.expenses,
        { name: this.newExpenseName, amount: this.newExpenseAmount },
      ];
      this.expenses = updatedExpenses;
      this.newExpenseName = '';
      this.newExpenseAmount = 0;
      StorageService.saveBudget(updatedExpenses); //! Save to storage
    }
  }

  handleRemoveExpense(index: number) {
    const updatedExpenses = this.expenses.filter((_, i) => i !== index);
    this.expenses = updatedExpenses;
    StorageService.saveBudget(updatedExpenses); //! Save after removal
  }

  getTotal(): number {
    return this.expenses.reduce((sum, item) => sum + item.amount, 0);
  }

  render() {
    return (
      <div class="budget-tracker">
        <h2 class="section-title">Budget Tracker</h2>

        <div class="input-group">
          <input
            type="text"
            value={this.newExpenseName}
            placeholder="Expense name"
            onInput={(e) => (this.newExpenseName = (e.target as HTMLInputElement).value)}
            class="input-field"
          />
          <input
            type="number"
            value={this.newExpenseAmount}
            placeholder="Amount"
            onInput={(e) => (this.newExpenseAmount = parseFloat((e.target as HTMLInputElement).value))}
            class="input-field"
          />
          <button class="add-btn" onClick={() => this.handleAddExpense()}>
            Add Expense
          </button>
        </div>

        <ul class="expense-list">
          {this.expenses.map((expense, index) => (
            <li class="expense-item">
              <span>
                <strong>{expense.name}</strong> — {expense.amount.toFixed(2)}
              </span>
              <button class="remove-btn" onClick={() => this.handleRemoveExpense(index)}>
                ❌
              </button>
            </li>
          ))}
        </ul>

        <h3 class="total">
          Total: <span>{this.getTotal().toFixed(2)}</span>
        </h3>
      </div>
    );
  }
}
