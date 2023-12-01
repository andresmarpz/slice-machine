import { Locator, Page } from "@playwright/test";

import { SliceMachinePage } from "./components/SliceMachinePage";

export class ChangelogPage extends SliceMachinePage {
  readonly breadcrumbLabel: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.breadcrumbLabel = this.body.getByText("Changelog");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  // Handle actions here

  /**
   * Assertions
   */
  // Handle assertions here
}
