// helper to get tasks
const getTasks = () => {
  let ids = []
  return new Cypress.Promise(resolve => {
    cy.get('[data-task]')
      .each($el =>
        cy.wrap($el)
          .invoke('attr', 'data-task')
          .then(id => ids.push(id))
      )
      .then(() => resolve(ids))
  })
}

export const checkAllTaskLinks = () => {
  getTasks().then(ids => {
    ids.forEach((id) => {
      cy.get(`[data-task=${id}]`).then(($el) => {
        cy.wrap($el).click();
        cy.contains("My cool business's Roadmap").should('not.exist')
        cy.contains($el.text()).should('exist')
        cy.contains("← Back to Roadmap").click();
      })
    })
  })
  cy.waitUntil(() => cy.contains("My cool business's Roadmap"))
}
