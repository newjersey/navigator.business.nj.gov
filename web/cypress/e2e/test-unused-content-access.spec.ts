describe("unusedContent accessibility test", () => {
  it("can access via cy.request", () => {
    cy.request("http://localhost:3000/mgmt/unusedContent").then((response) => {
      expect(response.status).to.eq(200);
      cy.log(`Response status: ${response.status}`);
      cy.log(`Response body length: ${response.body.length}`);
    });
  });

  it("can access via cy.visit with failOnStatusCode false", () => {
    cy.visit("/mgmt/unusedContent", { failOnStatusCode: false });
    cy.url().then((url) => {
      cy.log(`Current URL: ${url}`);
    });
  });
});
