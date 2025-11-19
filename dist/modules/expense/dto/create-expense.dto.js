"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseStatus = exports.PaymentMethod = exports.ExpenseCategory = exports.CreateExpenseDto = void 0;
class CreateExpenseDto {
}
exports.CreateExpenseDto = CreateExpenseDto;
var ExpenseCategory;
(function (ExpenseCategory) {
    ExpenseCategory["ELECTRICITY"] = "ELECTRICITY";
    ExpenseCategory["RENT"] = "RENT";
    ExpenseCategory["TRAVEL"] = "TRAVEL";
    ExpenseCategory["OFFICE_SUPPLIES"] = "OFFICE_SUPPLIES";
    ExpenseCategory["MAINTENANCE"] = "MAINTENANCE";
    ExpenseCategory["INTERNET"] = "INTERNET";
    ExpenseCategory["OTHER"] = "OTHER";
})(ExpenseCategory || (exports.ExpenseCategory = ExpenseCategory = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["CHEQUE"] = "CHEQUE";
    PaymentMethod["CARD"] = "CARD";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var ExpenseStatus;
(function (ExpenseStatus) {
    ExpenseStatus["PENDING"] = "PENDING";
    ExpenseStatus["APPROVED"] = "APPROVED";
    ExpenseStatus["REJECTED"] = "REJECTED";
})(ExpenseStatus || (exports.ExpenseStatus = ExpenseStatus = {}));
//# sourceMappingURL=create-expense.dto.js.map