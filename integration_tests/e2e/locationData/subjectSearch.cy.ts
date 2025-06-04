import SubjectsPage from '../../pages/locationData/subjects'
import Page from '../../pages/page'

context('Location Data', () => {
  context('Subject Search', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display the location data subjects page', () => {
      cy.visit('/location-data/subjects')
      Page.verifyOnPage(SubjectsPage)
    })
  })
})
