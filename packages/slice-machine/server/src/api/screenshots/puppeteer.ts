import axios from "axios";
import path from "path";
import puppeteer from "puppeteer";
import { ScreenDimensions } from "../../../../lib/models/common/Screenshots";
import Files from "../../../../lib/utils/files";

interface PuppeteerHandleProps {
  screenshotUrl: string;
  pathToFile: string;
  screenDimensions: ScreenDimensions;
}

let puppeteerBrowserPromise: Promise<puppeteer.Browser> | null = null;

export default {
  handleScreenshot: async ({
    screenshotUrl,
    pathToFile,
    screenDimensions,
  }: PuppeteerHandleProps): Promise<void> => {
    const { warning } = await testUrl(screenshotUrl);
    if (warning) throw new Error(warning);

    if (!puppeteerBrowserPromise) {
      puppeteerBrowserPromise = puppeteer.launch({
        defaultViewport: null,
      });
    }

    let puppeteerBrowser: puppeteer.Browser;

    try {
      puppeteerBrowser = await puppeteerBrowserPromise;
    } catch (e) {
      console.error(
        "Could not load pupeteer. Try re-installing your dependencies (`npm i`) to fix the issue"
      );
      throw e;
    }

    return generateScreenshot(
      puppeteerBrowser,
      screenshotUrl,
      pathToFile,
      screenDimensions
    );
  },
};

const generateScreenshot = async (
  browser: puppeteer.Browser,
  screenshotUrl: string,
  pathToFile: string,
  screenDimensions: ScreenDimensions
): Promise<void> => {
  // Create an incognito context to isolate screenshots.
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  await page.setViewport({
    width: screenDimensions.width,
    height: screenDimensions.height,
  });

  try {
    Files.mkdir(path.dirname(pathToFile), { recursive: true });

    await page.goto(screenshotUrl, {
      waitUntil: "load",
    });

    await page.waitForSelector("#__iframe-ready", { timeout: 10000 });
    const element = await page.$("#__iframe-renderer");

    const iframe = page.frames().find((f) => f.name() === "__iframe-renderer");
    const images = iframe ? await iframe.$$("img") : [];

    await Promise.all(
      images.map(async (img) => {
        await iframe?.waitForFunction((img) => img.complete, {}, img);
      })
    );

    if (element) {
      await element.screenshot({
        path: pathToFile,
        clip: {
          width: screenDimensions.width,
          height: screenDimensions.height,
          x: 0,
          y: 0,
        },
      });
    } else {
      console.error("Could not find Simulator iframe (#__iframe-renderer).");
    }

    await context.close();
    return;
  } catch (error) {
    console.error(error);
    await context.close();
    throw error;
  }
};

export const testUrl = async (
  screenshotUrl: string
): Promise<{ warning?: string }> => {
  try {
    await axios.get(screenshotUrl);
  } catch (e) {
    return {
      warning: "Could not connect to Slice Renderer. Model was saved.",
    };
  }
  return {};
};
