import "cypress-wait-until";
import { TYPES_FILE, CUSTOM_TYPE_MODEL } from "../consts";

/**
 * Create a Custom type and assert files are created.
 *
 * @param {string} id Id of the custom type.
 * @param {string} name Name of the custom type.
 */
export function createCustomType(id, name) {
  cy.visit("/");

  // create custom type
  cy.get("[data-cy=empty-state-main-button]").click();
  cy.get("[data-cy=create-ct-modal]").should("be.visible");

  cy.get("input[data-cy=ct-name-input]").type(name);
  cy.get("input[data-cy=ct-id-input]").should("have.value", id);
  cy.get("[data-cy=create-ct-modal]").submit();
  cy.location("pathname", { timeout: 15000 }).should("eq", `/cts/${id}`);
  cy.readFile(TYPES_FILE).should("contains", name);
  cy.readFile(CUSTOM_TYPE_MODEL(id));
}

/**
 * On the Custom Type builder, rename the custom type.
 *
 * @param {string} id Id of the custom type.
 * @param {string} actualName Current name of the custom type.
 * @param {string} newName New name for the custom type.
 */
export function renameCustomType(id, actualName, newName) {
  cy.visit("/");

  cy.get('[data-cy="edit-custom-type-menu"]').click();

  cy.get("[data-cy=edit-custom-type-menu-dropdown]").should("be.visible");

  cy.get('[data-cy="ct-rename-menu-option"]').click();

  cy.get('[data-cy="custom-type-name-input"]').should("have.value", actualName);
  cy.get('[data-cy="custom-type-name-input"]')
    .clear()
    .type(`${newName} - Edited`);
  cy.get("[data-cy=rename-custom-type-modal]").submit();
  cy.get("[data-cy=rename-custom-type-modal]").should("not.exist");

  cy.get(`[data-cy="custom-type-${id}-label"]`).contains("Edited");
  cy.readFile(TYPES_FILE).should("contains", `${newName} - Edited`);
  cy.readFile(CUSTOM_TYPE_MODEL(id)).then((model) => {
    expect(JSON.stringify(model)).to.contain(newName);
  });
}

/**
 * On the Custom Type builder, add static field to the custom type.
 *
 * @param {string} fieldType Type of field to create.
 * @param {string} fieldName Label of the new field.
 * @param {string} fieldId Id of the new field.
 */
export function addFieldToCustomType(fieldType, fieldName, fieldId) {
  cy.get(`[data-cy="add-Static-field"]`).first().click();
  cy.get(`[data-cy='${fieldType}']`).click();

  cy.get("[data-cy=new-field-name-input]").clear();
  // waiting for the field to re-render
  cy.wait(500);
  cy.get("[data-cy=new-field-name-input]").type(fieldName);

  // API Id modification for UID field is disabled
  if (fieldType != "UID") {
    cy.get("[data-cy=new-field-id-input]").clear();
    // waiting for the field to re-render
    cy.wait(500);
    cy.get("[data-cy=new-field-id-input]").type(fieldId);
  }

  cy.get("[data-cy=new-field-form]").submit();
  cy.get("[data-cy=ct-static-zone]").within(() => {
    cy.contains(fieldName).should("be.visible");
    cy.contains(`data.${fieldId}`).should("be.visible");
  });
}

/**
 * On the Custom Type builder, add slices to the custom type.
 *
 * @param {string[]} sliceIds Ids of slices to add to the custom type.
 */
export function addSlicesToCustomType(sliceIds) {
  cy.get("[data-cy=update-slices]").click();

  sliceIds.forEach((sliceId) => {
    // forcing this because the input itself is invisible and an svg is displayed
    cy.get(`[data-cy=check-${sliceId}]`).click({ force: true });
  });

  cy.get("[data-cy=update-slices-modal]").submit();
}

/**
 * On the Custom Type builder, save all changes.
 */
export function saveCustomTypeModifications() {
  cy.get("[data-cy=builder-save-button]").should("not.be.disabled");
  cy.get("[data-cy=builder-save-button]").click();
  cy.get("[data-cy=builder-save-button-spinner]").should("be.visible");
  cy.get("[data-cy=builder-save-button-icon]").should("be.visible");
}
