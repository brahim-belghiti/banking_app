import type { Account, TransferRequest, DepositRequest, Transaction } from '@/types';
import { canTransact, validateTransfer, validateDeposit, canCancelTransaction } from '../transaction-rules';

const baseAccount: Account = {
    id: "1",
    userId: "u1",
    label: "Test",
    type: "checking",
    balance: 100000,
    currency: "MAD",
    status: "active",
    createdAt: "2025-01-01T00:00:00Z",
}

const baseRequest: TransferRequest = {
    fromAccountId: "1",
    toAccountId: "2",
    amount: 1000,
    label: "Test transfer",
    category: "other",
}

const baseDepositRequest: DepositRequest = {
    toAccountId: "1",
    amount: 1000,
    label: "Test deposit",
    category: "other",
}

const baseTransaction: Transaction = {
    id: "tx1",
    fromAccountId: "1",
    toAccountId: "2",
    amount: 1000,
    currency: "MAD",
    type: "transfer",
    category: "other",
    label: "Test transaction",
    status: "pending",
    reference: "ref1",
    createdAt: "2025-01-01T00:00:00Z",
    completedAt: null,
}


describe('Transaction Rules', () => {
    // Tests for canTransact
    describe('canTransact', () => {
        it('should allow transactions on active accounts', () => {
            const account = { ...baseAccount, id: '1', status: 'active' } as Account
            expect(canTransact(account)).toEqual({ valid: true })
        })

        it('should block transactions on frozen accounts', () => {
            const account = { ...baseAccount, id: '2', status: 'frozen' } as Account
            expect(canTransact(account)).toEqual({ valid: false, message: "Ce compte est gelé — aucune opération possible" })
        })

        it('should block transactions on closed accounts', () => {
            const account = { ...baseAccount, id: '3', status: 'closed' } as Account
            expect(canTransact(account)).toEqual({ valid: false, message: "Ce compte est clôturé — consultation uniquement" })
        })
    })

    // Tests for validateTransfer
    describe('validateTransfer', () => {
        const fromAccount = { ...baseAccount, id: '1', type: 'checking', balance: 100000 } as Account
        const toAccount = { ...baseAccount, id: '2', type: 'checking', balance: 50000 } as Account

        it('should validate a normal transfer', () => {
            const request = { ...baseRequest, fromAccountId: fromAccount.id, toAccountId: toAccount.id }
            expect(validateTransfer(fromAccount, toAccount, request)).toEqual({ valid: true })
        })

        it('should block transfer if from account is frozen', () => {
            const frozenFrom = { ...fromAccount, status: 'frozen' } as Account
            const request = { ...baseRequest, fromAccountId: frozenFrom.id, toAccountId: toAccount.id }
            expect(validateTransfer(frozenFrom, toAccount, request)).toEqual({ valid: false, message: "Ce compte est gelé — aucune opération possible" })
        })

        it('should block transfer if to account is closed', () => {
            const closedTo = { ...toAccount, status: 'closed' } as Account
            const request = { ...baseRequest, fromAccountId: fromAccount.id, toAccountId: closedTo.id }
            expect(validateTransfer(fromAccount, closedTo, request)).toEqual({ valid: false, message: "Le compte destinataire est indisponible" })
        })

        it('should block transfer to the same account', () => {
            const request = { ...baseRequest, fromAccountId: fromAccount.id, toAccountId: fromAccount.id }
            expect(validateTransfer(fromAccount, fromAccount, request)).toEqual({ valid: false, message: "Impossible de transférer vers le même compte" })
        })

        it('should block transfer with non-positive amount', () => {
            const request = { ...baseRequest, fromAccountId: fromAccount.id, toAccountId: toAccount.id, amount: 0 }
            expect(validateTransfer(fromAccount, toAccount, request)).toEqual({ valid: false, message: "Le montant doit être supérieur à 0" })
        })

        it('should block transfer from savings account with insufficient balance', () => {
            const savingsFrom = { ...fromAccount, type: 'savings', balance: 500 } as Account
            const request = { ...baseRequest, fromAccountId: savingsFrom.id, toAccountId: toAccount.id, amount: 1000 }
            expect(validateTransfer(savingsFrom, toAccount, request)).toEqual({ valid: false, message: "Solde insuffisant — pas de découvert sur un compte épargne" })
        })
    })

    describe('validateDeposit', () => {
        const toAccount = { ...baseAccount, id: '2', type: 'checking', balance: 50000 } as Account

        it('should validate a normal deposit', () => {
            const request = { ...baseDepositRequest, toAccountId: toAccount.id }
            expect(validateDeposit(toAccount, request)).toEqual({ valid: true })
        })

        it('should block deposit if account is frozen', () => {
            const frozenTo = { ...toAccount, status: 'frozen' } as Account
            const request = { ...baseDepositRequest, toAccountId: frozenTo.id }
            expect(validateDeposit(frozenTo, request)).toEqual({ valid: false, message: "Ce compte est gelé — aucune opération possible" })
        })

        it('should block deposit if account is closed', () => {
            const closedTo = { ...toAccount, status: 'closed' } as Account
            const request = { ...baseDepositRequest, toAccountId: closedTo.id }
            expect(validateDeposit(closedTo, request)).toEqual({ valid: false, message: "Ce compte est clôturé — consultation uniquement" })
        })

        it('should block deposit with non-positive amount', () => {
            const request = { ...baseDepositRequest, toAccountId: toAccount.id, amount: 0 }
            expect(validateDeposit(toAccount, request)).toEqual({ valid: false, message: "Le montant doit être supérieur à 0" })
        })
    })

    describe('canCancelTransaction', () => {
        it('should allow cancellation of pending transactions', () => {
            const pendingTx = { ...baseTransaction, status: 'pending' } as Transaction
            expect(canCancelTransaction(pendingTx)).toEqual({ valid: true })
        })

        it('should block cancellation of completed transactions', () => {
            const completedTx = { ...baseTransaction, status: 'completed' } as Transaction
            expect(canCancelTransaction(completedTx)).toEqual({ valid: false, message: "Seules les transactions en attente peuvent être annulées" })
        })




    })
})