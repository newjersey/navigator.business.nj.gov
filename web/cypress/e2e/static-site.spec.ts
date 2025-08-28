// const sitemap = await fetch("https://business.nj.gov/sitemap.xml").then((res) => res.text());

// sitemap.replace("https://business.nj.gov", "https://businessnj.webflow.io");

cy.visit("https://businessnj.webflow.io/");
cy.checkA11y();
