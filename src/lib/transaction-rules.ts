import type { Account, TransferRequest, DepositRequest } from "@/types"

type RuleResult = { valid: true } | { valid: false; message: string }

export function canTransact(account: Account): RuleResult {
    if (account.status === "frozen") return { valid: false, message: "Ce compte est gelé — aucune opération possible" }
    if (account.status === "closed") return { valid: false, message: "Ce compte est clôturé — consultation uniquement" }
    return { valid: true }
}

export function validateTransfer(
    from: Account,
    to: Account,
    request: TransferRequest
): RuleResult {
    const fromCheck = canTransact(from)
    if (!fromCheck.valid) return fromCheck

    const toCheck = canTransact(to)
    if (!toCheck.valid) return { valid: false, message: "Le compte destinataire est indisponible" }

    if (from.id === to.id) return { valid: false, message: "Impossible de transférer vers le même compte" }

    if (request.amount <= 0) return { valid: false, message: "Le montant doit être supérieur à 0" }

    if (from.type === "savings" && from.balance < request.amount) {
        return { valid: false, message: "Solde insuffisant — pas de découvert sur un compte épargne" }
    }

    return { valid: true }
}

export function validateDeposit(
    to: Account,
    request: DepositRequest
): RuleResult {
    const check = canTransact(to)
    if (!check.valid) return check

    if (request.amount <= 0) return { valid: false, message: "Le montant doit être supérieur à 0" }

    return { valid: true }
}