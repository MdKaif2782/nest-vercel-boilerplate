"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseStatus = exports.PaymentMethod = exports.ExpenseCategory = exports.CreateExpenseDto = void 0;
class CreateExpenseDto {
}
exports.CreateExpenseDto = CreateExpenseDto;
var ExpenseCategory;
(function (ExpenseCategory) {
    ExpenseCategory["SALARY"] = "SALARY";
    ExpenseCategory["OFFICE_RENT"] = "OFFICE_RENT";
    ExpenseCategory["ELECTRICITY_BILL"] = "ELECTRICITY_BILL";
    ExpenseCategory["INTERNET_PHONE_BILL"] = "INTERNET_PHONE_BILL";
    ExpenseCategory["TRANSPORTATION_FUEL"] = "TRANSPORTATION_FUEL";
    ExpenseCategory["OFFICE_SUPPLIES_STATIONERY"] = "OFFICE_SUPPLIES_STATIONERY";
    ExpenseCategory["REPAIR_MAINTENANCE"] = "REPAIR_MAINTENANCE";
    ExpenseCategory["MARKETING_ADVERTISING"] = "MARKETING_ADVERTISING";
    ExpenseCategory["REFRESHMENT_FOOD"] = "REFRESHMENT_FOOD";
    ExpenseCategory["TRAINING_DEVELOPMENT"] = "TRAINING_DEVELOPMENT";
    ExpenseCategory["COURIER_DELIVERY"] = "COURIER_DELIVERY";
    ExpenseCategory["INVESTOR_PAYMENT"] = "INVESTOR_PAYMENT";
    ExpenseCategory["PURCHASE_ORDER_PAYMENT"] = "PURCHASE_ORDER_PAYMENT";
    ExpenseCategory["EMPLOYEE_ADVANCE"] = "EMPLOYEE_ADVANCE";
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