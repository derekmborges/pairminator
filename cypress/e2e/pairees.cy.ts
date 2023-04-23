import { v4 as uuidv4 } from 'uuid'

describe('Pairees', () => {
    before(() => {
        cy.visit('/new')
        cy.get('[data-cy=project-name]').type(uuidv4())
        cy.get('[data-cy=project-password').type(uuidv4())
        cy.get('[data-cy=submit]').click()
    })

    beforeEach(() => {
        cy.visit('/dashboard')
    })

    after(() => {
        cy.get('[data-cy=sign-out]').click()
    })

    it('allows user to add pairees', () => {
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
})