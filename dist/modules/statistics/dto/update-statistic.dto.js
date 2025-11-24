"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStatisticDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_statistic_dto_1 = require("./create-statistic.dto");
class UpdateStatisticDto extends (0, swagger_1.PartialType)(create_statistic_dto_1.CreateStatisticDto) {
}
exports.UpdateStatisticDto = UpdateStatisticDto;
//# sourceMappingURL=update-statistic.dto.js.map