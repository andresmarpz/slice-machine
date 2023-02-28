import path from "path";
import * as t from "io-ts";
import { getOrElseW } from "fp-ts/lib/Either";

import { Screenshot, ComponentInfo, ComponentMocks } from "../models";

import { resolvePathsToScreenshot } from "./screenshot";
import Files from "../node-utils/files";
import { Slices, VariationSM } from "../models/Slice";

import Errors from "../utils/errors";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

/** take a path to slice and return its name  */
function getComponentName(slicePath: string): string | undefined {
  const split = slicePath.split(path.sep);
  const pop = split.pop();
  if (!pop) return;

  if (pop.indexOf("index.") === 0) {
    return split.pop();
  }
  if (pop.indexOf(split[split.length - 1]) === 0) {
    return slicePath.split(path.sep).pop();
  }
  return pop.split(".")[0];
}

/** naive method to find component file in a folder */
function findComponentFile(
  files: ReadonlyArray<string>,
  componentName: string
): string | undefined {
  const possiblePaths = ["index", componentName].reduce(
    (acc: string[], f: string) => [
      ...acc,
      `${f}.vue`,
      `${f}.js`,
      `${f}.jsx`,
      `${f}.ts`,
      `${f}.tsx`,
      `${f}.svelte`,
    ],
    []
  );
  return files.find((e) => possiblePaths.indexOf(e) > -1);
}

function matchPossiblePaths(files: ReadonlyArray<string>): boolean {
  const modelFilename = "model.json";

  return files.includes(modelFilename);
}

function splitExtension(str: string): {
  fileName: string | null;
  extension: string | null;
} {
  const fullName = str.split("/").pop();
  if (!fullName) {
    return {
      fileName: null,
      extension: null,
    };
  }

  const [fileName, extension] = fullName.split(".");
  return {
    fileName,
    extension,
  };
}

/** returns component file/directory info */
function getFileInfoFromPath(
  slicePath: string,
  componentName: string
): { fileName: string | null; extension: string | null } {
  const isDirectory = Files.isDirectory(slicePath);
  if (!isDirectory) {
    return { ...splitExtension(slicePath) };
  }

  const files = Files.readDirectory(slicePath);
  const match = matchPossiblePaths(files);

  if (match) {
    const maybeFileComponent = findComponentFile(files, componentName);
    if (maybeFileComponent) {
      return { ...splitExtension(maybeFileComponent) };
    }
    return { fileName: null, extension: null };
  }
  throw new Error(
    `[slice-machine] Could not find module file for component "${componentName}" at path "${slicePath}"`
  );
}

export function getComponentInfo(
  slicePath: string,
  assetsPaths: ReadonlyArray<string>,
  basePath: string,
  from: string
): ComponentInfo | undefined {
  const sliceName = getComponentName(slicePath);

  if (!sliceName || !sliceName.length) {
    console.error(
      `[queries/component-info] Could not find slice name at path "${slicePath}". Skipping...`
    );
    return;
  }

  const fileInfo = (() => {
    try {
      return getFileInfoFromPath(slicePath, sliceName);
    } catch (e) {
      return null;
    }
  })();

  if (fileInfo === null) {
    return;
  }

  const { fileName, extension } = fileInfo;

  const model = Files.readEntityFromFile(
    path.join(slicePath, "model.json"),
    (payload) =>
      getOrElseW((e: t.Errors) => new Error(Errors.report(e)))(
        SharedSlice.decode(payload)
      )
  );
  if (!model) {
    return;
  }
  if (model instanceof Error) {
    console.error(
      `Could not parse model ${path.basename(
        slicePath
      )}\nFull error: ${model.toString()}`
    );
    return;
  }

  const smModel = Slices.toSM(model);
  const screenshots = (smModel.variations || [])
    .map((v: VariationSM) => {
      const variationScreenshot = resolvePathsToScreenshot({
        paths: assetsPaths,
        from,
        sliceName,
        variationId: v.id,
      });
      return variationScreenshot && { [v.id]: variationScreenshot };
    })
    .reduce(
      (
        acc: { [variationId: string]: Screenshot },
        variationPreview: { [variationId: string]: Screenshot } | undefined
      ) => {
        return { ...acc, ...variationPreview };
      },
      {}
    );

  /* This illustrates the requirement for apps to pass paths to mocks */
  const mocks = (() => {
    const resolvedMocks = Files.readEntityFromFile<ComponentMocks>(
      path.join(basePath, from, sliceName, "mocks.json"),
      (payload: unknown) => {
        return getOrElseW(() => new Error("Invalid SharedSlice mocks"))(
          ComponentMocks.decode(payload)
        );
      }
    );
    if (resolvedMocks instanceof Error) return;
    return resolvedMocks;
  })();

  return {
    fileName,
    extension,
    model: smModel,
    mock: mocks,
    screenshots,
  };
}
