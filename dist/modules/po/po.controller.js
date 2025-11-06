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
exports.PoController = void 0;
const common_1 = require("@nestjs/common");
const po_service_1 = require("./po.service");
const create_po_dto_1 = require("./dto/create-po.dto");
const update_po_dto_1 = require("./dto/update-po.dto");
let PoController = class PoController {
    constructor(poService) {
        this.poService = poService;
    }
    create(createPoDto) {
        return this.poService.create(createPoDto);
    }
    findAll() {
        return this.poService.findAll();
    }
    findOne(id) {
        return this.poService.findOne(+id);
    }
    update(id, updatePoDto) {
        return this.poService.update(+id, updatePoDto);
    }
    remove(id) {
        return this.poService.remove(+id);
    }
};
exports.PoController = PoController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_po_dto_1.CreatePoDto]),
    __metadata("design:returntype", void 0)
], PoController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PoController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PoController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_po_dto_1.UpdatePoDto]),
    __metadata("design:returntype", void 0)
], PoController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PoController.prototype, "remove", null);
exports.PoController = PoController = __decorate([
    (0, common_1.Controller)('po'),
    __metadata("design:paramtypes", [po_service_1.PoService])
], PoController);
//# sourceMappingURL=po.controller.js.map