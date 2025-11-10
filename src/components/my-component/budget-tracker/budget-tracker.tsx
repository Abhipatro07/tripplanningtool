//! checking 
import { Component, State, h } from '@stencil/core';
import { StorageService } from '../../../Services/storage-service';

@Component({
  tag: 'budget-tracker',
  styleUrl: 'budget-tracker.css',
  shadow: true,
})
export class BudgetTracker {
  @State() expenses: { name: string; amount: number; isCustom?: boolean }[] = [];
  @State() newExpenseName: string = '';
  @State() newExpenseAmount: number = 0;
  @State() editingIndex: number | null = null;
  @State() editAmount: number = 0;

  componentWillLoad() {
    this.loadBudget();

    //! Listen for updates from itinerary builder
    window.addEventListener('budgetUpdated', () => {
      this.loadBudget();
    });
  }

  private loadBudget() {
    this.expenses = StorageService.loadBudget();
  }

  handleAddExpense() {
    //! Add custom user expense
    //* Adds a new custom expense item (for example, “Airport Taxi” ₹800).
    //* Saves it in local storage.
    //* Dispatches a global budgetUpdated event to let the itinerary know about the new expense (for potential sync).
    //* Resets the input fields after adding.
    //* This enables adding custom budgets apart from itinerary-linked costs.
    if (!this.newExpenseName.trim() || this.newExpenseAmount <= 0) return;

    const newItem = {
      name: this.newExpenseName.trim(),
      amount: this.newExpenseAmount,
      isCustom: true, // mark it as user-created
    };

    const updatedExpenses = [...this.expenses, newItem];
    this.expenses = updatedExpenses;
    StorageService.saveBudget(updatedExpenses);

    // Notify itinerary builder (optional, only if shared updates needed)
    window.dispatchEvent(new CustomEvent('budgetUpdated'));

    this.newExpenseName = '';
    this.newExpenseAmount = 0;
  }

  handleEditExpense(index: number) {
    this.editingIndex = index;
    this.editAmount = this.expenses[index].amount;
  }

  saveEdit(index: number) {
    //* Updates the amount in the expense list.
    //* Saves it to localStorage.
    //* Looks for a matching itinerary item (by name) and updates its cost there too.
    //* Sends the budgetUpdated event → itinerary updates instantly.
    //* Exits editing mode.
    //* ✅ Keeps both itinerary and budget tracker 100% synchronized.
    const updated = [...this.expenses];
    updated[index].amount = this.editAmount;
    this.expenses = updated;
    StorageService.saveBudget(updated);

    //! Update itinerary cost too (if it's a linked place)
    const itinerary = StorageService.loadItinerary().map((item) =>
      item.name === updated[index].name ? { ...item, cost: updated[index].amount } : item
    );
    StorageService.saveItinerary(itinerary);

    window.dispatchEvent(new CustomEvent('budgetUpdated'));
    this.editingIndex = null;
  }

  handleRemoveExpense(index: number) {
    const updated = this.expenses.filter((_, i) => i !== index);
    this.expenses = updated;
    StorageService.saveBudget(updated);
    window.dispatchEvent(new CustomEvent('budgetUpdated'));
  }

  getTotal(): number {
    return this.expenses.reduce((sum, item) => sum + item.amount, 0);
  }

  render() {
  return (
    <div class="budget-tracker">
      <h2 class="section-title">Budget Tracker</h2>

      {/* ➕ Add custom expense */}
      <div class="input-group">
        <input
          type="text"
          value={this.newExpenseName}
          placeholder="Enter expense name (e.g. Taxi, Tickets)"
          onInput={(e) => (this.newExpenseName = (e.target as HTMLInputElement).value)}
          class="input-field"
        />
        <input
          type="number"
          value={this.newExpenseAmount}
          placeholder="Amount"
          onInput={(e) =>
            (this.newExpenseAmount = parseFloat((e.target as HTMLInputElement).value))
          }
          class="input-field"
        />
        <button class="add-btn" onClick={() => this.handleAddExpense()}>
          Add Expense
        </button>
      </div>

      {/* 💸 Expense List */}
      <ul class="expense-list">
        {this.expenses.map((expense, index) => (
          <li class="expense-item">
            <span>
              <strong>{expense.name}</strong> —{" "}
              {this.editingIndex === index ? (
                <input
                  type="number"
                  value={this.editAmount}
                  onInput={(e) =>
                    (this.editAmount = parseFloat(
                      (e.target as HTMLInputElement).value
                    ))
                  }
                  class="edit-input"
                />
              ) : (
                `₹${expense.amount.toFixed(2)}`
              )}
            </span>

            {/* Actions Section (Edit/Save + Delete) */}
            <div class="actions">
              {this.editingIndex === index ? (
                <button class="save-btn" onClick={() => this.saveEdit(index)}>
                  Save
                </button>
              ) : (
                <button
                  class="edit-btn"
                  onClick={() => this.handleEditExpense(index)}
                >
                  Edit
                </button>
              )}

              <button
                class="remove-btn"
                onClick={() => this.handleRemoveExpense(index)}
              >
                ❌
              </button>
            </div>
          </li>
        ))}
      </ul>

      <h3 class="total">
        Total: <span>₹{this.getTotal().toFixed(2)}</span>
      </h3>
    </div>
  );
}

}
