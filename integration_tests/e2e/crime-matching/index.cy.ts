context('Crime Mapping', () => {
    context('Visual Regression Checks', () => {
        beforeEach(() => {
            cy.task('reset')
            cy.task('stubSignIn')
            cy.signIn()
        })
    
        it('Should display all points and tracks', () => {
            cy.visit('/crime-mapping')
            cy.wait(3000)
            cy.get('#locations').click()
            cy.wait(1000)
            cy.compareSnapshot('crime-mapping-basic')
        })
    })
})