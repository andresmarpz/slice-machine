import { expect, Locator, Page } from "@playwright/test";
import { Modal } from "../Modal.page";

export class RenameTypeModalPage extends Modal{
  readonly nameInput: Locator;

  constructor(page: Page) {
    super(page, /Rename a (page|custom) type/, "Rename")
    this.nameInput = this.root.getByTestId("custom-type-name-input");
  }

  async renameType(newName: string) {
    await expect(this.title).toBeVisible();
    await this.nameInput.fill(newName);
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }
}
