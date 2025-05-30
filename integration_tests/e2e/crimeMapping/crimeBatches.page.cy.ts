import Page from '../../pages/page'
import CrimeBatchesPage from '../../pages/crimeMapping/crimeBatches'

context('Crime Mapping', () => {
  context('Crime Batches', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display the crime batches page', () => {
      cy.visit('/crime-mapping/crime-batches')
      Page.verifyOnPage(CrimeBatchesPage)
    })
  })
})
