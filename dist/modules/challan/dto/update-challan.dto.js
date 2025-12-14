"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateChallanDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_challan_dto_1 = require("./create-challan.dto");
class UpdateChallanDto extends (0, swagger_1.PartialType)(create_challan_dto_1.CreateChallanDto) {
}
exports.UpdateChallanDto = UpdateChallanDto;
//# sourceMappingURL=update-challan.dto.js.map