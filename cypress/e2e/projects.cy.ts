import { v4 as uuidv4 } from 'uuid'

describe('Project Creation', () => {
    beforeEach(() => {
        cy.visit('/new')
    })

    it('allows user to create a new project', () => {
        cy.get('[data-cy=page-header]').should('contain.text', 'Create a project')

        const projectName = uuidv4()
        cy.get('[data-cy=project-name]').type(projectName)

        cy.get('[data-cy=project-password').type(uuidv4())

        cy.get('[data-cy=submit]').click()

        cy.location().should((location) => {
            expect(location.href).to.eq('http://localhost:3000/pairminator#/dashboard')
        })

        cy.get('[data-cy=current-project-name]').should('have.text', projectName)
        cy.get('[data-cy=sign-out]').click()
    })

    it('form submit is disabled when either field is below minimum character requirement', () => {
        cy.get('[data-cy=submit]').should('not.be.enabled')

        cy.get('[data-cy=project-name]').type('1') // 1/2 chars
        cy.get('[data-cy=submit]').should('not.be.enabled')

        cy.get('[data-cy=project-password').type('12345') // 5/6 chars
        cy.get('[data-cy=submit]').should('not.be.enabled')

        cy.get('[data-cy=project-name]').type('12') // minimum 2 chars
        cy.get('[data-cy=project-password').type('123456') // minimum 6 chars

        cy.get('[data-cy=submit]').should('be.enabled')
    })

    it('prevents user from creating duplicate project name', () => {
        cy.get('[data-cy=page-header]').should('contain.text', 'Create a project')

        const projectName = uuidv4()
        cy.get('[data-cy=project-name]').type(projectName)
        cy.get('[data-cy=project-password').type(uuidv4())
        cy.get('[data-cy=submit]').click()

        cy.get('[data-cy=current-project-name]').should('have.text', projectName)
        cy.get('[data-cy=sign-out]').click()

        cy.visit('/new')

        // re-use same project name
        cy.get('[data-cy=project-name]').type(projectName)
        cy.get('[data-cy=project-password').type(uuidv4())
        cy.get('[data-cy=submit]').click()

        cy.get('[data-cy=new-project-error]').should('have.text', 'Project name is not available')
    })
})