"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_po_dto_1 = require("./create-po.dto");
class UpdatePoDto extends (0, swagger_1.PartialType)(create_po_dto_1.CreatePoDto) {
}
exports.UpdatePoDto = UpdatePoDto;
//# sourceMappingURL=update-po.dto.js.map