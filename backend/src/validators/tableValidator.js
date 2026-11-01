import { ValidationError } from "../utils/errors.js";

export function validateTableId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new ValidationError("Table id must be a positive integer");
    }
    return id;
}

export function validateCreateTable(body = {}) {
    const { name, minBet, bigBet, decisionTimeSec, maxBuyIn } = body;
    if (typeof name !== "string" || !name.trim()) {
        throw new ValidationError("Table name is required");
    }
    if (!Number.isInteger(minBet) || minBet <= 0) {
        throw new ValidationError("Minimum bet must be a positive integer");
    }
    if (bigBet !== undefined && (!Number.isInteger(bigBet) || bigBet <= 0)) {
        throw new ValidationError("Big bet must be a positive integer");
    }
    if (decisionTimeSec !== undefined && (!Number.isInteger(decisionTimeSec) || decisionTimeSec <= 0)) {
        throw new ValidationError("Decision time must be a positive integer");
    }
    if (maxBuyIn !== undefined && (!Number.isInteger(maxBuyIn) || maxBuyIn <= 0)) {
        throw new ValidationError("Maximum buy-in must be a positive integer");
    }
    return {
        name: name.trim(),
        minBet,
        bigBet: bigBet ?? minBet * 2,
        decisionTimeSec: decisionTimeSec ?? 30,
        maxBuyIn: maxBuyIn ?? 1000,
    };
}

// Nickname is temporary guest input; after authenticateJWT, use req.user and its profile nickname.
export function validateNickname(body = {}) {
    const { nickname } = body;
    if (typeof nickname !== "string" || !nickname.trim()) {
        throw new ValidationError("Nickname is required");
    }
    return nickname.trim();
}

export function validateReady(body = {}) {
    if (typeof body.nickname !== "string" || !body.nickname.trim()) {
        throw new ValidationError("Nickname is required");
    }
    if (typeof body.ready !== "boolean") {
        throw new ValidationError("Ready must be a boolean");
    }
    return { nickname: body.nickname.trim(), ready: body.ready };
}

export function validateKick(body = {}) {
    const nickname = validateNickname(body);
    if (typeof body.targetNickname !== "string" || !body.targetNickname.trim()) {
        throw new ValidationError("Target nickname is required");
    }
    return { nickname, targetNickname: body.targetNickname.trim() };
}

export function validateLeave(body = {}) {
    return validateNickname(body);
}

export function validateStart(body = {}) {
    return validateNickname(body);
}
