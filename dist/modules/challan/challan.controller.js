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
exports.ChallanController = void 0;
const common_1 = require("@nestjs/common");
const challan_service_1 = require("./challan.service");
const dto_1 = require("./dto");
let ChallanController = class ChallanController {
    constructor(challanService) {
        this.challanService = challanService;
    }
    async getPendingBPOs() {
        return this.challanService.getPendingBPOs();
    }
    async getDispatchSummary() {
        return this.challanService.getDispatchSummary();
    }
    async markAsDispatched(dto) {
        return this.challanService.markAsDispatched(dto);
    }
    async getChallansByBPO(bpoId) {
        return this.challanService.getChallansByBPOId(bpoId);
    }
    async getAllChallans() {
        return this.challanService.getAllChallans();
    }
    async createChallan(dto) {
        return this.challanService.createChallan(dto);
    }
    async getChallanById(id) {
        return this.challanService.getChallanById(id);
    }
    async updateChallanStatus(id, dto) {
        return this.challanService.updateChallanStatus(id, dto);
    }
};
exports.ChallanController = ChallanController;
__decorate([
    (0, common_1.Get)('pending-bpos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChallanController.prototype, "getPendingBPOs", null);
__decorate([
    (0, common_1.Get)('dispatch-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChallanController.prototype, "getDispatchSummary", null);
__decorate([
    (0, common_1.Post)('dispatch-bpo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.DispatchBPODto]),
    __metadata("design:returntype", Promise)
], ChallanController.prototype, "markAsDispatched", null);
__decorate([
    (0, common_1.Get)('bpo/:bpoId/challans'),
    __param(0, (0, common_1.Param)('bpoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChallanController.prototype, "getChallansByBPO", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChallanController.prototype, "getAllChallans", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateChallanDto]),
    __metadata("design:returntype", Promise)
], ChallanController.prototype, "createChallan", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChallanController.prototype, "getChallanById", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateChallanStatusDto]),
    __metadata("design:returntype", Promise)
], ChallanController.prototype, "updateChallanStatus", null);
exports.ChallanController = ChallanController = __decorate([
    (0, common_1.Controller)('challans'),
    __metadata("design:paramtypes", [challan_service_1.ChallanService])
], ChallanController);
//# sourceMappingURL=challan.controller.js.map