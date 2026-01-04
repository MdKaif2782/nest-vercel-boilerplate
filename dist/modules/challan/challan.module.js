"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallanModule = void 0;
const common_1 = require("@nestjs/common");
const challan_service_1 = require("./challan.service");
const challan_controller_1 = require("./challan.controller");
const pdf_module_1 = require("../pdf/pdf.module");
let ChallanModule = class ChallanModule {
};
exports.ChallanModule = ChallanModule;
exports.ChallanModule = ChallanModule = __decorate([
    (0, common_1.Module)({
        imports: [pdf_module_1.PdfModule],
        controllers: [challan_controller_1.ChallanController],
        providers: [challan_service_1.ChallanService],
    })
], ChallanModule);
//# sourceMappingURL=challan.module.js.map