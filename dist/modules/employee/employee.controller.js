"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const common_1 = require("@nestjs/common");
const employee_service_1 = require("./employee.service");
const dto_1 = require("./dto");
let EmployeeController = class EmployeeController {
    constructor(employeeService) {
        this.employeeService = employeeService;
    }
    async create(createEmployeeDto) {
        try {
            const employee = await this.employeeService.create(createEmployeeDto);
            return {
                statusCode: common_1.HttpStatus.CREATED,
                message: 'Employee created successfully',
                data: employee,
            };
        }
        catch (error) {
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: error.message,
            };
        }
    }
    async findAll() {
        const employees = await this.employeeService.findAll();
        return {
            statusCode: common_1.HttpStatus.OK,
            data: employees,
        };
    }
    async getPayables(month, year) {
        try {
            const payables = await this.employeeService.getPayables(month, year);
            return { statusCode: common_1.HttpStatus.OK, data: payables };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: error.message };
        }
    }
    async getSalaryStatistics(month, year) {
        try {
            const statistics = await this.employeeService.getSalaryStatistics(month, year);
            return { statusCode: common_1.HttpStatus.OK, data: statistics };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: error.message };
        }
    }
    async getMonthlyTrends(year) {
        try {
            const trends = await this.employeeService.getMonthlyTrends(year);
            return { statusCode: common_1.HttpStatus.OK, data: trends };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: error.message };
        }
    }
    async getSalaryReport(month, year) {
        try {
            const report = await this.employeeService.getSalaryReport(month, year);
            return { statusCode: common_1.HttpStatus.OK, data: report };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: error.message };
        }
    }
    async getAdvanceOverview() {
        try {
            const overview = await this.employeeService.getAdvanceOverview();
            return { statusCode: common_1.HttpStatus.OK, data: overview };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: error.message };
        }
    }
    async createSalary(createSalaryDto) {
        try {
            const salary = await this.employeeService.createSalary(createSalaryDto);
            return {
                statusCode: common_1.HttpStatus.CREATED,
                message: 'Salary record created successfully',
                data: salary,
            };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: error.message };
        }
    }
    async paySalary(paySalaryDto) {
        try {
            const result = await this.employeeService.paySalary(paySalaryDto);
            return {
                statusCode: common_1.HttpStatus.OK,
                message: 'Salary paid successfully',
                data: result,
            };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: error.message };
        }
    }
    async generateMonthlySalaries(month, year) {
        try {
            const result = await this.employeeService.generateMonthlySalaries(month, year);
            return {
                statusCode: common_1.HttpStatus.CREATED,
                message: 'Monthly salaries generated successfully',
                data: result,
            };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: error.message };
        }
    }
    async findOne(id) {
        try {
            const employee = await this.employeeService.findOne(id);
            return { statusCode: common_1.HttpStatus.OK, data: employee };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.NOT_FOUND, message: error.message };
        }
    }
    async update(id, updateEmployeeDto) {
        try {
            const employee = await this.employeeService.update(id, updateEmployeeDto);
            return {
                statusCode: common_1.HttpStatus.OK,
                message: 'Employee updated successfully',
                data: employee,
            };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: error.message };
        }
    }
    async remove(id) {
        try {
            await this.employeeService.remove(id);
            return {
                statusCode: common_1.HttpStatus.OK,
                message: 'Employee deactivated successfully',
            };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: error.message };
        }
    }
    async getSalaries(id) {
        try {
            const salaries = await this.employeeService.getSalaries(id);
            return { statusCode: common_1.HttpStatus.OK, data: salaries };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: error.message };
        }
    }
    async getSalaryPreview(id, month, year) {
        try {
            const preview = await this.employeeService.getSalaryPreview(id, month, year);
            return { statusCode: common_1.HttpStatus.OK, data: preview };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: error.message };
        }
    }
    async giveAdvance(id, dto) {
        try {
            const result = await this.employeeService.giveAdvance(id, dto);
            return {
                statusCode: common_1.HttpStatus.CREATED,
                message: 'Advance given successfully',
                data: result,
            };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: error.message };
        }
    }
    async adjustAdvance(id, dto) {
        try {
            const result = await this.employeeService.adjustAdvance(id, dto);
            return {
                statusCode: common_1.HttpStatus.OK,
                message: 'Advance adjusted successfully',
                data: result,
            };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: error.message };
        }
    }
    async getAdvanceHistory(id, page, limit) {
        try {
            const history = await this.employeeService.getAdvanceHistory(id, page, limit);
            return { statusCode: common_1.HttpStatus.OK, data: history };
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: error.message };
        }
    }
};
exports.EmployeeController = EmployeeController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateEmployeeDto]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('payables/salaries'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getPayables", null);
__decorate([
    (0, common_1.Get)('statistics/salaries'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getSalaryStatistics", null);
__decorate([
    (0, common_1.Get)('trends/salaries'),
    __param(0, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getMonthlyTrends", null);
__decorate([
    (0, common_1.Get)('reports/salaries'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getSalaryReport", null);
__decorate([
    (0, common_1.Get)('advances/overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getAdvanceOverview", null);
__decorate([
    (0, common_1.Post)('salaries'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSalaryDto]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "createSalary", null);
__decorate([
    (0, common_1.Post)('salaries/pay'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PaySalaryDto]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "paySalary", null);
__decorate([
    (0, common_1.Post)('salaries/generate-monthly'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "generateMonthlySalaries", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateEmployeeDto]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/salaries'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getSalaries", null);
__decorate([
    (0, common_1.Get)(':id/salary-preview'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('month', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('year', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getSalaryPreview", null);
__decorate([
    (0, common_1.Post)(':id/advance'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.GiveAdvanceDto]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "giveAdvance", null);
__decorate([
    (0, common_1.Post)(':id/advance/adjust'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AdjustAdvanceDto]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "adjustAdvance", null);
__decorate([
    (0, common_1.Get)(':id/advances'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "getAdvanceHistory", null);
exports.EmployeeController = EmployeeController = __decorate([
    (0, common_1.Controller)('employees'),
    __metadata("design:paramtypes", [employee_service_1.EmployeeService])
], EmployeeController);
//# sourceMappingURL=employee.controller.js.map