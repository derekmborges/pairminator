import { v4 as uuidv4 } from 'uuid'
import { times } from 'lodash'

describe('Pairs', () => {
    beforeEach(() => {
        cy.visit('/new')
        cy.get('[data-cy=project-name]').type(uuidv4())
        cy.get('[data-cy=project-password').type(uuidv4())
        cy.get('[data-cy=submit]').click()
    })

    afterEach(() => {
        cy.get('[data-cy=sign-out]').click()
    })

    const addPairees = (numPairees: number) => {
        let pairees: string[] = []
        times(numPairees, (n: number) => {
            pairees.push(`Pairee${n + 1}`)
        })
        for (let pairee of pairees) {
            cy.get('[data-cy=new-pairee-name').type(pairee)
            cy.get('[data-cy=add-pairee]').click()
            cy.get('[data-cy=new-pairee-alert]').should('have.text', 'Pairee added successfully')
            cy.get('body').click() // Make toast disappear
        }
    }

    it('allows user to assign pairs for even number of pairees', () => {
        const expectedNumLanes = 2
        addPairees(expectedNumLanes * 2)
        cy.get('[data-cy=no-current-pairs-label').should('have.text', 'No pairs have been assigned yet.')

        cy.get('[data-cy=assign-pairs-button]').click()

        cy.get('[data-cy=lane-name]').should('have.length', expectedNumLanes)
        cy.get('[data-cy=lane-name]').each((label, i) => {
            const lane = i + 1
            expect(label.text()).to.equal(`Lane ${lane}`)
        })
        cy.get(`[data-cy=pairee1-name]`).should('have.length', expectedNumLanes)
        cy.get(`[data-cy=pairee2-name]`).should('have.length', expectedNumLanes)
    })

    it('allows user to assign pairs for odd number of pairees', () => {
        const expectedNumLanes = 3
        addPairees(expectedNumLanes * 2 - 1)
        cy.get('[data-cy=no-current-pairs-label').should('have.text', 'No pairs have been assigned yet.')

        cy.get('[data-cy=assign-pairs-button]').click()

        cy.get('[data-cy=lane-name]').should('have.length', expectedNumLanes)
        cy.get('[data-cy=lane-name]').each((label, i) => {
            const lane = i + 1
            expect(label.text()).to.equal(`Lane ${lane}`)
        })
        cy.get(`[data-cy=pairee1-name]`).should('have.length', expectedNumLanes)
        cy.get(`[data-cy=pairee2-name]`).should('have.length', expectedNumLanes - 1)
    })

    it('allows user to record assigned pairs and see the assignment in the history', () => {
        addPairees(2)
        cy.get('[data-cy=no-current-pairs-label').should('have.text', 'No pairs have been assigned yet.')
        cy.get('[data-cy=no-history-label]').should('have.text', 'Record pairs to see a recent history.')

        cy.get('[data-cy=assign-pairs-button]').click()
        cy.get('[data-cy=lane-name]').should('have.length', 1)


        cy.get('[data-cy=record-pairs-button]').click()
        cy.get('[data-cy=recorded-pairs-alert]').should('have.text', 'Pairs recorded')
        cy.get('[data-cy=history-record]').should('have.length', 1)
    })
})