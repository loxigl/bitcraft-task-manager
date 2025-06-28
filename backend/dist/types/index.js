"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Priority = exports.TaskStatus = exports.ProfessionType = void 0;
var ProfessionType;
(function (ProfessionType) {
    ProfessionType["CARPENTRY"] = "carpentry";
    ProfessionType["FARMING"] = "farming";
    ProfessionType["FISHING"] = "fishing";
    ProfessionType["FORAGING"] = "foraging";
    ProfessionType["FORESTRY"] = "forestry";
    ProfessionType["HUNTING"] = "hunting";
    ProfessionType["LEATHERWORKING"] = "leatherworking";
    ProfessionType["MASONRY"] = "masonry";
    ProfessionType["MINING"] = "mining";
    ProfessionType["SCHOLAR"] = "scholar";
    ProfessionType["SMITHING"] = "smithing";
    ProfessionType["TAILORING"] = "tailoring";
})(ProfessionType || (exports.ProfessionType = ProfessionType = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["OPEN"] = "open";
    TaskStatus["TAKEN"] = "taken";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["CANCELLED"] = "cancelled";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var Priority;
(function (Priority) {
    Priority["LOW"] = "low";
    Priority["MEDIUM"] = "medium";
    Priority["HIGH"] = "high";
    Priority["CRITICAL"] = "critical";
})(Priority || (exports.Priority = Priority = {}));
//# sourceMappingURL=index.js.map