describe("blog_app", () => {
  beforeEach(() => {
    cy.request("POST", `${Cypress.env("BACKEND")}/testing/reset`);
    const user = {
      name: "Thom ",
      username: "Moht",
      password: "Acc113",
    };
    cy.request("POST", `${Cypress.env("BACKEND")}/users`, user);

    const user2 = {
      name: "Tony ",
      username: "Ynot",
      password: "Acc113",
    };
    cy.request("POST", `${Cypress.env("BACKEND")}/users`, user2);
    cy.visit("");
  });

  it("Login page can be opened", () => {
    cy.contains("Blogs");
  });

  it("Login form is shown", () => {
    cy.contains("username");
    cy.contains("password");
  });

  it("Login succeeds with correct credentials", () => {
    cy.get("#username").type("Moht");
    cy.get("#password").type("Acc113");
    cy.get("#login-button").click();
    cy.contains("Thom is logged in");
  });

  it("Login fails with incorrect credentials", () => {
    cy.get("#username").type("Moht");
    cy.get("#password").type("A4222222");
    cy.get("#login-button").click();

    cy.get("#notification")
      .should("contain", "wrong credentials")
      .and("have.css", "color", "rgb(255, 0, 0)")
      .and("have.css", "border-style", "solid");

    cy.get("html").should("not.contain", "Thom is logged in");
  });

  describe("When logged in", () => {
    beforeEach(() => {
      cy.login({ username: "Moht", password: "Acc113" });
      cy.contains("Add Blog").click();
      cy.get("#title").type("First Book");
      cy.get("#author").type("First Author");
      cy.get("#url").type("FirstUrl.com");
      cy.get("#blogSubmit").click();
    });

    it("Can create a new blog post", () => {
      cy.contains("Add Blog").click();
      cy.get("#title").type("New Book");
      cy.get("#author").type("New Author");
      cy.get("#url").type("NewUrl.com");
      cy.get("#blogSubmit").click();

      cy.contains("New Book");
      cy.contains("New Author");
    });

    it("Can delete a blog post", () => {
      cy.contains("Add Blog").click();
      cy.get("#title").type("New Book");
      cy.get("#author").type("New Author");
      cy.get("#url").type("NewUrl.com");
      cy.get("#blogSubmit").click();

      cy.contains("New Book").contains("delete").click();
      cy.contains("New Book").should("not.exist");
      cy.contains("New Author").should("not.exist");
    });

    it("Can only delete a blog post if user created it", () => {
      cy.contains("Logout").click();
      cy.login({ username: "Ynot", password: "Acc113" });
      cy.contains("Tony is logged in");
      cy.contains("First Book").within(() => {
        cy.get("button").contains("delete").should("not.exist");
      });
    });
  });
});
