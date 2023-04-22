
describe('Project Registration', () => {
    beforeEach(() => {
        cy.visit('/new')
    })

    it('allows user to create a new project', () => {
        cy.get('[data-cy=page-header]').should('contain.text', 'Create a project')

        cy.get('[data-cy=project-name]').type('test-project1')
        cy.get('[data-cy=project-password').type('123456')

        cy.get('[data-cy=submit]').click()

        cy.location().should((location) => {
            expect(location.href).to.eq('http://localhost:3000/pairminator#/dashboard')
        })
    })
})