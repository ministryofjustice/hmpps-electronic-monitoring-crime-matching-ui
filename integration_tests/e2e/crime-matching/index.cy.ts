context('Crime Mapping', () => {
  context('Visual Regression Checks', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn')
      cy.signIn()
    })

    it('Should display the map with all features shown by default', () => {
      cy.visit('/crime-mapping')

      cy.window().then(window => {
        window.addEventListener('map:render:complete', cy.stub().as('map:render'))
      })

      cy.get('@map:render').should('have.been.calledOnce')
      cy.compareSnapshot('crime-mapping-all-features-visible')
    })

    it('Should hide the locations when the checkbox is clicked', () => {
      cy.visit('/crime-mapping')

      cy.window().then(window => {
        window.addEventListener('map:render:complete', cy.stub().as('map:render'))
      })

      // The map should be rendered on load
      cy.get('@map:render').should('have.been.calledOnce')
      cy.get('#locations').click()

      // The map should be rendered again after the user interaction
      cy.get('@map:render').should('have.been.calledTwice')
      cy.compareSnapshot('crime-mapping-locations-hidden')
    })

    it('Should hide the tracks when the checkbox is clicked', () => {
      cy.visit('/crime-mapping')

      cy.window().then(window => {
        window.addEventListener('map:render:complete', cy.stub().as('map:render'))
      })

      // The map should be rendered on load
      cy.get('@map:render').should('have.been.calledOnce')
      cy.get('#tracks').click()

      // The map should be rendered again after the user interaction
      cy.get('@map:render').should('have.been.calledTwice')
      cy.compareSnapshot('crime-mapping-tracks-hidden')
    })

    it('Should hide locations & tracks when both checkboxes clicked', () => {
      cy.visit('/crime-mapping')

      cy.window().then(window => {
        window.addEventListener('map:render:complete', cy.stub().as('map:render'))
      })

      // The map should be rendered on load
      cy.get('@map:render').should('have.been.calledOnce')
      cy.get('#locations').click()

      // The map should be rendered again after the user interaction
      cy.get('@map:render').should('have.been.calledTwice')
      cy.get('#tracks').click()

      // The map should be rendered again after the user interaction
      cy.get('@map:render').should('have.been.calledThrice')
      cy.compareSnapshot('crime-mapping-all-features-hidden')
    })
  })
})
