import { v4 as uuidv4 } from 'uuid'

describe('Pairees', () => {
    beforeEach(() => {
        cy.visit('/new')
        cy.get('[data-cy=project-name]').type(uuidv4())
        cy.get('[data-cy=project-password').type(uuidv4())
        cy.get('[data-cy=submit]').click()
    })

    afterEach(() => {
        cy.get('[data-cy=sign-out]').click()
    })

    it('allows user to add multiple pairees', () => {
        const pairees = ['John', 'Stacey']
        for (let pairee of pairees) {
            cy.get('[data-cy=new-pairee-name').type(pairee)
            cy.get('[data-cy=add-pairee]').click()
            cy.get('[data-cy=new-pairee-alert]').should('have.text', 'Pairee added successfully')
        }

        cy.get('[data-cy=pairee-name]').should('have.length', 2)
        cy.get('[data-cy=pairee-name]').each((label, i) => {
            expect(label.text()).to.equal(pairees[i])
        })
    })

    it('clears out pairee text field upon adding', () => {
        cy.get('[data-cy=new-pairee-name').type('Somebody')
        cy.get('[data-cy=add-pairee]').click()
        cy.get('[data-cy=new-pairee-alert]').should('have.text', 'Pairee added successfully')
        cy.get('[data-cy=new-pairee-name').should('have.value', '')
    })

    it('prevents user from adding pairee with the same name', () => {
        const name = 'Alex'
        cy.get('[data-cy=new-pairee-name').type(name)
        cy.get('[data-cy=add-pairee]').click()
        cy.get('[data-cy=new-pairee-alert]').should('have.text', 'Pairee added successfully')

        cy.get('[data-cy=new-pairee-name').type(name)
        cy.get('[data-cy=add-pairee]').click()

        cy.get('[data-cy=pairee-add-error]').should('have.text', 'Pairee name already exists.')
    })

    // TODO: fix the delete modal bug and re-activate test
    it.skip('allows user to delete a pairee', () => {
        const pairees = ['John', 'Stacey']
        for (let pairee of pairees) {
            cy.get('[data-cy=new-pairee-name').type(pairee)
            cy.get('[data-cy=add-pairee]').click()
            cy.get('[data-cy=new-pairee-alert]').should('have.text', 'Pairee added successfully')
        }
        cy.get('[data-cy=pairee-name]').should('have.length', 2)
        const paireeToDelete = pairees[0]

        cy.get(`[data-cy=pairee-row-${paireeToDelete}]`).trigger('mouseover')
        cy.get('[data-cy=pairee-delete-button]').click()

        cy.get('[data-cy=delete-modal-text').should('have.text', `Remove ${paireeToDelete} from pairees?`)

        cy.get('[data-cy=pairee-confirm-delete-button]').click()

        cy.get('[data-cy=deleted-pairee-alert]').should('have.text', 'Pairee deleted successfully')
        cy.get('[data-cy=pairee-name]').should('have.length', 1).should('have.text', pairees[1])
    })
})