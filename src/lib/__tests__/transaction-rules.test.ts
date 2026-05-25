import type { Account } from '@/types';
import { canTransact } from '../transaction-rules';

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

})