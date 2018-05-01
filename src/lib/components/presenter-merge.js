import React, { Component } from 'react';
import yaml from 'js-yaml';
import { Diff } from 'react-diff-view';
import { structuredPatch } from 'diff';

import 'react-diff-view/index.css';

const yamlOpts = {
  sortKeys: true,
  noRefs: true
};

export default class PresenterMerge extends Component {
  render() {
    const { destinationBranchName, presenter, currentHeadPresenter } = this.props;
    const presenterYaml = yaml.safeDump(presenter.toJS(), yamlOpts);
    const currentHeadYaml = yaml.safeDump(currentHeadPresenter.toJS(), yamlOpts);
    const patch = structuredPatch('Presenter', 'Presenter', currentHeadYaml, presenterYaml, 'Their changes', 'Your changes');
    const hunks = patch.hunks.map(hunk => {
      const oldLineMapping = getLineMapping(hunk.oldStart, hunk.lines, '-');
      const newLineMapping = getLineMapping(hunk.newStart, hunk.lines, '+');
      return convertHunk('Presenter', oldLineMapping, newLineMapping, hunk);
    });

    return (
      <div>
        <p>
          It looks like someone else made changes to {destinationBranchName} since you started working.
          Below, you will see the changes that they made on the left and the changes that you made on the right.
          For each change, decide whether the new {destinationBranchName} should include their change, yours, or
          a new, merged change.
        </p>
        <Diff
          diffType="modify"
          viewType="split"
          hunks={hunks} />
      </div>
    )
  }
}

const changeTypes = Object.freeze({
  '+': 'insert',
  '-': 'delete'
});

function getLineMapping(startLineNumber, lines, includedChangeType) {
  const { mapping } = lines.reduce(({ mapping, lineCount }, line, lineNumber) => {
    const changeType = changeTypes[line[0]];
    if ( !changeType || changeType === includedChangeType ) {
      mapping[lineNumber] = lineCount + 1;
      return {
        mapping,
        lineCount: lineCount + 1
      }
    }

    return {
      mapping,
      lineCount
    };
  }, { mapping: {}, lineCount: 0 });

  return mapping;
}

function convertHunk(filename, oldLineMapping, newLineMapping, hunk) {
  return {
    oldStart: hunk.oldStart,
    oldLines: hunk.oldLines,
    newStart: hunk.newStart,
    newLines: hunk.newLines,
    content: filename,
    changes: hunk.lines.map((content, lineNumber) => {
      const firstChar = content[0];
      const type = changeTypes[firstChar] || 'normal';

      return {
        oldLineNumber: oldLineMapping[lineNumber],
        newLineNumber: newLineMapping[lineNumber],
        isNormal: type === 'normal',
        isInsert: type === 'insert',
        isDelete: type === 'delete',
        type,
        lineNumber,
        content
      };
    })
  };
}
