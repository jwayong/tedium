/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

'use strict';

import * as fs from 'fs';
import * as path from 'path';

import {register} from '../cleanup-pass';
import {ElementRepo} from '../element-repo.ts';
import {existsSync, makeCommit, getJsBinLink} from './util';

/**
 * Generates the CONTRIBUTING.md file for the element.
 */
async function generateContributionGuide(element: ElementRepo): Promise<void> {
  const pathToCanonicalGuide = 'repos/ContributionGuide/CONTRIBUTING.md';
  if (!existsSync(pathToCanonicalGuide)) {
    throw new Error(
        'Couldn\'t find canonical contribution guide. git checkout error?');
  }

  let contributionGuideContents =
      fs.readFileSync(pathToCanonicalGuide, 'utf8');
  const pathToExistingGuide = path.join(element.dir, 'CONTRIBUTING.md');
  let guideExists = false;
  let existingGuideContents = '';
  if (existsSync(pathToExistingGuide)) {
    guideExists = true;
    existingGuideContents = fs.readFileSync(pathToExistingGuide, 'utf8');
  }

  let desiredJsbinLink = getJsBinLink(element);
  // Replace the markdown link to jsbin with the intended one.
  // The existing one will look like:
  //     [http://jsbin.com/cagye](http://jsbin.com/cagye/edit?html,javascript)
  contributionGuideContents = contributionGuideContents.replace(
      /\[https?:\/\/jsbin\.com\/.*?\]\s*\(https?:\/\/jsbin.com\/.*?\)/, `[${desiredJsbinLink}](${desiredJsbinLink})`);

  // Insert the preamble
  contributionGuideContents = `<!--
This file is autogenerated based on
https://github.com/PolymerElements/ContributionGuide/blob/master/CONTRIBUTING.md

If you edit that file, it will get updated everywhere else.
If you edit this file, your changes will get overridden :)

You can however override the jsbin link with one that's customized to this
specific element:

jsbin=${desiredJsbinLink}
-->

${contributionGuideContents}`;

  // Write the new contribution guide only if it's changed.
  if (contributionGuideContents === existingGuideContents) {
    return;
  }
  fs.writeFileSync(pathToExistingGuide, contributionGuideContents, 'utf8');
  let commitMessage = '[skip ci] Update contribution guide';
  if (!guideExists) {
    commitMessage = '[skip ci] Create contribution guide';
  }
  await makeCommit(element, ['CONTRIBUTING.md'], commitMessage);
}

register({
  name: 'contribution-guide',
  pass: generateContributionGuide,
  runsByDefault: true,
});
