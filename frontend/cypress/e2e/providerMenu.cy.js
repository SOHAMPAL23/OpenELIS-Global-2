import ProviderMenuPage from "../pages/ProviderMenu";

describe("Provider Menu", () => {
  beforeEach(() => {
    // Intercept API calls and fixtures (mock data if required)
    cy.intercept("GET", "/rest/ProviderMenu*", {
      fixture: "providerMenuList.json",
    }).as("getProviderMenu");
    cy.visit("/providerMenu"); // Adjust URL based on your app's routing
  });

  it("should load provider menu and show correct title", () => {
    ProviderMenuPage.pageHeading.should("contain.text", "Provider Menu");
  });

  it("should add a new provider successfully", () => {
    ProviderMenuPage.openAddModal();

    const providerData = {
      lastName: "Smith",
      firstName: "John",
      telephone: "1234567890",
      fax: "9876543210",
      isActive: "Yes",
    };

    ProviderMenuPage.addProvider(
      providerData.lastName,
      providerData.firstName,
      providerData.telephone,
      providerData.fax,
      providerData.isActive,
    );

    // Assert that a success message or update is displayed after adding
    cy.contains("Provider added successfully").should("be.visible");
    // Ensure that the provider appears in the list
    cy.get("table tbody").contains(providerData.lastName);
  });

  it("should search and filter provider list", () => {
    const searchTerm = "Smith";
    ProviderMenuPage.searchProvider(searchTerm);

    // Assert that the results are filtered by search term
    cy.get("table tbody").find("tr").should("have.length.greaterThan", 0);
    cy.get("table tbody").contains(searchTerm);
  });

  it("should update an existing provider", () => {
    // Open provider update modal for a specific provider
    const providerId = 1; // Example provider ID, adjust as necessary
    ProviderMenuPage.openUpdateModal(providerId);

    const updatedData = {
      lastName: "Doe",
      firstName: "Jane",
      telephone: "5551234567",
      fax: "5559876543",
      isActive: "No",
    };

    // Update the provider details
    ProviderMenuPage.updateProvider(
      updatedData.lastName,
      updatedData.firstName,
      updatedData.telephone,
      updatedData.fax,
      updatedData.isActive,
    );

    // Verify that the updated details are reflected in the table
    cy.get(`tr[data-id="${providerId}"]`).within(() => {
      cy.contains(updatedData.lastName);
      cy.contains(updatedData.firstName);
      cy.contains(updatedData.telephone);
      cy.contains(updatedData.fax);
    });
  });

  it("should deactivate a provider", () => {
    // Select a provider and deactivate
    const providerId = 1;
    ProviderMenuPage.selectRowById(providerId);

    // Assuming there is a button for deactivating
    ProviderMenuPage.deactivateButton.click();

    // Verify that the provider is deactivated
    cy.get(`tr[data-id="${providerId}"]`).within(() => {
      cy.contains("No"); // Assuming 'No' indicates deactivated status
    });
  });

  it("should paginate through provider menu", () => {
    ProviderMenuPage.navigateToNextPage();
    cy.url().should("include", "page=2"); // Adjust based on how pagination works

    ProviderMenuPage.navigateToPreviousPage();
    cy.url().should("include", "page=1"); // Adjust based on how pagination works
  });
});
