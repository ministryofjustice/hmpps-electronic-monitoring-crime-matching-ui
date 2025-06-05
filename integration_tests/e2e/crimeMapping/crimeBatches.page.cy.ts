import Page from '../../pages/page'
import CrimeBatchesPage from '../../pages/crimeMapping/crimeBatches'

const url = '/crime-mapping/crime-batches'

context('Crime Mapping', () => {
  context('Crime Batches', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('should display the crime batches page', () => {
      cy.visit(url)
      Page.verifyOnPage(CrimeBatchesPage)
    })

    it('should display the no result message when no search results', () => {
      cy.visit(url)
      const page = Page.verifyOnPage(CrimeBatchesPage)

      page.dataTable.shouldNotHaveResults()
    })
  })
})
