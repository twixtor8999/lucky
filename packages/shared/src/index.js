"use strict";
// Export Domain Types & Enums
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultWorkflowStatus = exports.TransactionStatus = exports.TransactionType = exports.LedgerEntryType = exports.BalanceType = exports.BetStatus = exports.BetTypeCode = exports.MarketStatus = exports.UserStatus = exports.UserRole = void 0;
// User & Auth Types
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPPORT"] = "SUPPORT";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
    UserStatus["BLOCKED"] = "BLOCKED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
// Market & Bet Types
var MarketStatus;
(function (MarketStatus) {
    MarketStatus["OPEN"] = "OPEN";
    MarketStatus["CLOSED"] = "CLOSED";
    MarketStatus["SUSPENDED"] = "SUSPENDED";
    MarketStatus["ARCHIVED"] = "ARCHIVED";
})(MarketStatus || (exports.MarketStatus = MarketStatus = {}));
var BetTypeCode;
(function (BetTypeCode) {
    BetTypeCode["SINGLE_ANK"] = "SINGLE_ANK";
    BetTypeCode["JODI"] = "JODI";
    BetTypeCode["SINGLE_PATTI"] = "SINGLE_PATTI";
    BetTypeCode["DOUBLE_PATTI"] = "DOUBLE_PATTI";
    BetTypeCode["TRIPLE_PATTI"] = "TRIPLE_PATTI";
    BetTypeCode["HALF_SANGAM"] = "HALF_SANGAM";
    BetTypeCode["FULL_SANGAM"] = "FULL_SANGAM";
})(BetTypeCode || (exports.BetTypeCode = BetTypeCode = {}));
// Betting Engine
var BetStatus;
(function (BetStatus) {
    BetStatus["ACTIVE"] = "ACTIVE";
    BetStatus["WON"] = "WON";
    BetStatus["LOST"] = "LOST";
    BetStatus["CANCELLED"] = "CANCELLED";
    BetStatus["SETTLED"] = "SETTLED";
})(BetStatus || (exports.BetStatus = BetStatus = {}));
// Wallet & Ledger
var BalanceType;
(function (BalanceType) {
    BalanceType["CASH"] = "CASH";
    BalanceType["BONUS"] = "BONUS";
    BalanceType["LOCKED"] = "LOCKED";
})(BalanceType || (exports.BalanceType = BalanceType = {}));
var LedgerEntryType;
(function (LedgerEntryType) {
    LedgerEntryType["CREDIT"] = "CREDIT";
    LedgerEntryType["DEBIT"] = "DEBIT";
})(LedgerEntryType || (exports.LedgerEntryType = LedgerEntryType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "DEPOSIT";
    TransactionType["WITHDRAWAL"] = "WITHDRAWAL";
    TransactionType["BET_PLACED"] = "BET_PLACED";
    TransactionType["BET_WON"] = "BET_WON";
    TransactionType["BET_REFUND"] = "BET_REFUND";
    TransactionType["WELCOME_BONUS"] = "WELCOME_BONUS";
    TransactionType["PROMOTIONAL_BONUS"] = "PROMOTIONAL_BONUS";
    TransactionType["ADMIN_ADJUSTMENT"] = "ADMIN_ADJUSTMENT";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["REJECTED"] = "REJECTED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
// Result Publishing Workflow
var ResultWorkflowStatus;
(function (ResultWorkflowStatus) {
    ResultWorkflowStatus["DRAFT"] = "DRAFT";
    ResultWorkflowStatus["SUBMITTED"] = "SUBMITTED";
    ResultWorkflowStatus["APPROVED"] = "APPROVED";
    ResultWorkflowStatus["PUBLISHED"] = "PUBLISHED";
    ResultWorkflowStatus["REJECTED"] = "REJECTED";
})(ResultWorkflowStatus || (exports.ResultWorkflowStatus = ResultWorkflowStatus = {}));
