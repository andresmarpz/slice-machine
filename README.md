<p align="center">
  <a href="https://slicemachine.dev">
    <img src=".github/logo.svg" alt="Slice Machine logo" width="220" />
  </a>
</p>
<p align="center">
  Develop and work with <a href="https://prismic.io">Prismic</a> slices, locally.
</p>

# Slice Machine

[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![npm version][npm-version-src]][npm-version-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![License][license-src]][license-href]

<!-- [![Codecov][codecov-src]][codecov-href] -->

As a developer tool, the main goal of Slice Machine is to perfect the process of working with a CMS while developing components locally.

### 1. Build reusable website sections
We call them Slices. Create and iterate on your Slices within your codebase, without going back and forth to a web app.

It takes a few seconds to generate components with corresponding data models. Everything is stored and versioned right inside your code.

### 2. Preview your components locally
While you build your components, you'll need to preview them. Slice Machine generates updated mocks to display content in the context of your app — without querying any remote content.

### 3. Ship your library to a page builder
Once you're done creating your components locally, publish them to Prismic. You get a full-fledged online content editor, tailored to your components' data models. Content editors can preview Slices from there and create pages without any help!


---

## Install

```bash
npx @slicemachine/init
```

### Install required deps

```bash
# using React/Next
npm i --save next-slicezone prismic-reactjs
# or using Vue/Nuxt
npm i --save vue-slicezone nuxt-sm
````

Nuxt users: you will have to add `nuxt-sm` to your `nuxt.config.js` modules section.  
<br>
### Documentation
For full documentation, visit the [the official Prismic documentation][prismic-docs].  
<br>
### Launch Slice Machine

You should now be ready to launch the plugin:
```bash
npm run slicemachine
````
Once the CLI  gives you information regarding your project, open the given localhost address to start working.

---

### Previewing Slices
Once you are familiar with the plugin and you created a Slice, you should notice that a folder has been created inside your slices library. It contains a component code and its Prismic data model.

You should also notice that a `.slicemachine` folder has been generated. It contains (notably) the generated mocks for each of your Slices.

Import both your component and its mock in a page to preview it:

```javascript
import { MySlice } from '../slices'
import MySliceMocks from '../.slicemachine/assets/slices/MySlice/mocks.json'

// In case of Next.js
const Page = () => (
  <div>
    <MySlice slice={MySliceMocks[0]} />
  </div>
)
````
Note that `MySliceMocks` is an array of Slice variations. You get 1 Slice mock per variation.

### Publishing your library
Once you're happy with the result, it's time to publish it to Prismic. Note that if you want to be able to use a Slice in one of your pages (Custom types), you will have to click on "Add slices" in the Custom types editor and select the Slices to be used.

Pushing a Custom type to Prismic will push all the Slices that are linked to it.

Inside Prismic.io, you should now be able to create documents and use the Slices you defined locally using Slice Machine 🎉

### Next step

Connect your pages to Prismic!

Next user? Check [this page](https://prismic.io/docs/technologies/query-api-nextjs) out!
Nuxt user? Check [this page](https://prismic.io/docs/technologies/query-content-from-cms-nuxtjs) instead.

If you use another technology, it's probably listed there: https://prismic.io/docs

Have fun!

---
## Contributing

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd love to have you as part of the Prismic developer community!

**Asking a question**: [Open a new topic][forum-question] on our community forum explaining what you want to achieve / your question. Our support team will get back to you shortly.

**Reporting a bug**: [Open an issue][repo-bug-report] explaining your application's setup and the bug you're encountering.

**Suggesting an improvement**: [Open an issue][repo-feature-request] explaining your improvement or feature so we can discuss and learn more.

**Submitting code changes**: For small fixes, feel free to [open a PR][repo-pull-requests] with a description of your changes. For large changes, please first [open an issue][repo-feature-request] so we can discuss if and how the changes should be implemented.

## License

```
   Copyright 2013-2021 Prismic <contact@prismic.io> (https://prismic.io)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

<!-- Links -->

[prismic]: https://prismic.io

<!-- TODO: Replace link with a more useful one if available -->

[prismic-docs]: https://prismic.io/docs
[changelog]: /CHANGELOG.md

<!-- TODO: Replace link with a more useful one if available -->

[forum-question]: https://community.prismic.io
[repo-bug-report]: https://github.com/prismicio/slice-machine/issues/new?assignees=&labels=bug&template=bug_report.md&title=
[repo-feature-request]: https://github.com/prismicio/slice-machine/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=
[repo-pull-requests]: https://github.com/prismicio/slice-machine/pulls

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/slice-machine-ui/latest.svg
[npm-version-href]: https://npmjs.com/package/slice-machine-ui
[npm-downloads-src]: https://img.shields.io/npm/dm/slice-machine-ui.svg
[npm-downloads-href]: https://npmjs.com/package/slice-machine-ui
[github-actions-ci-src]: https://github.com/prismicio/slice-machine/workflows/test/badge.svg
[github-actions-ci-href]: https://github.com/prismicio/slice-machine/actions?query=workflow%3Atest
[codecov-src]: https://img.shields.io/codecov/c/github/prismicio/slice-machine.svg
[codecov-href]: https://codecov.io/gh/prismicio/slice-machine
[conventional-commits-src]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[conventional-commits-href]: https://conventionalcommits.org
[license-src]: https://img.shields.io/npm/l/slice-machine-ui.svg
[license-href]: https://npmjs.com/package/slice-machine-ui
