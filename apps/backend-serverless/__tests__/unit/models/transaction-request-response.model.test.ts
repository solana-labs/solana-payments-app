import { parseAndValidateTransactionRequestResponse } from '../../../src/models/transaction-request-response.model.js'

describe('unit testing transaction request response model', () => {
    it('valid transaction request response model', () => {
        const validTransactionRequestResponse = {
            transaction: 'some-transaction',
            message: 'some-message',
        }

        expect(() => {
            parseAndValidateTransactionRequestResponse(
                validTransactionRequestResponse
            )
        }).not.toThrow()
    })

    it('missing transaction value', () => {
        const invalidTransactionRequestResponse = {
            message: 'some-message',
        }

        expect(() => {
            parseAndValidateTransactionRequestResponse(
                invalidTransactionRequestResponse
            )
        }).toThrow()
    })
})
