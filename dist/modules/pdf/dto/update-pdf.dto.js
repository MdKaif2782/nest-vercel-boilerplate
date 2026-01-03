"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePdfDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_pdf_dto_1 = require("./create-pdf.dto");
class UpdatePdfDto extends (0, swagger_1.PartialType)(create_pdf_dto_1.CreatePdfDto) {
}
exports.UpdatePdfDto = UpdatePdfDto;
//# sourceMappingURL=update-pdf.dto.js.map