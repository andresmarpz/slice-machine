import { revalidateData } from "@prismicio/editor-support/Suspense";
import { useSliceMachineConfig } from "@src/hooks/useSliceMachineConfig";
import { managerClient } from "@src/managerClient";

import { GitRepoSpecifier } from "./types";
import { getHasWriteAPIToken } from "./useHasWriteAPIToken";
import { getLinkedGitRepos } from "./useLinkedGitRepos";

export const useLinkedGitReposActions = () => {
  const [config] = useSliceMachineConfig();

  return {
    linkRepo: async (git: GitRepoSpecifier) => {
      await managerClient.git.linkRepo({
        prismic: { domain: config.repositoryName },
        git,
      });

      revalidateData(getLinkedGitRepos, [
        { prismic: { domain: config.repositoryName } },
      ]);
    },
    unlinkRepo: async (git: GitRepoSpecifier) => {
      await managerClient.git.unlinkRepo({
        prismic: { domain: config.repositoryName },
        git,
      });

      revalidateData(getLinkedGitRepos, [
        { prismic: { domain: config.repositoryName } },
      ]);
      revalidateData(getHasWriteAPIToken, [
        {
          prismic: { domain: config.repositoryName },
          git,
        },
      ]);
    },
  };
};
