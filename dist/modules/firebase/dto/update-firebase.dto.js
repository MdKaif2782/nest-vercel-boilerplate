"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFirebaseDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_firebase_dto_1 = require("./create-firebase.dto");
class UpdateFirebaseDto extends (0, mapped_types_1.PartialType)(create_firebase_dto_1.CreateFirebaseDto) {
}
exports.UpdateFirebaseDto = UpdateFirebaseDto;
//# sourceMappingURL=update-firebase.dto.js.map