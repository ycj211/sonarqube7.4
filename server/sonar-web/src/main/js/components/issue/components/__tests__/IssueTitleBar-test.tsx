/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as React from 'react';
import { shallow } from 'enzyme';
import IssueTitleBar from '../IssueTitleBar';
import {
  ShortLivingBranch,
  Issue,
  BranchType,
  IssueType,
  FlowLocation
} from '../../../../app/types';

const issue: Issue = {
  actions: [],
  component: 'main.js',
  componentLongName: 'main.js',
  componentQualifier: 'FIL',
  componentUuid: 'foo1234',
  creationDate: '2017-03-01T09:36:01+0100',
  flows: [],
  fromHotspot: false,
  key: 'AVsae-CQS-9G3txfbFN2',
  line: 25,
  message: 'Reduce the number of conditional operators (4) used in the expression',
  organization: 'myorg',
  project: 'myproject',
  projectKey: 'foo',
  projectName: 'Foo',
  projectOrganization: 'org',
  rule: 'javascript:S1067',
  ruleName: 'foo',
  secondaryLocations: [],
  severity: 'MAJOR',
  status: 'OPEN',
  textRange: { startLine: 25, endLine: 26, startOffset: 0, endOffset: 15 },
  transitions: [],
  type: IssueType.Bug
};

const issueWithLocations: Issue = {
  ...issue,
  flows: [[loc(), loc(), loc()], [loc(), loc()]],
  secondaryLocations: [loc(), loc()]
};

function loc(): FlowLocation {
  return {
    component: 'main.js',
    textRange: { startLine: 1, startOffset: 1, endLine: 2, endOffset: 2 }
  };
}

it('should render the titlebar correctly', () => {
  const branch: ShortLivingBranch = {
    isMain: false,
    mergeBranch: 'master',
    name: 'feature-1.0',
    type: BranchType.SHORT
  };
  const element = shallow(
    <IssueTitleBar branchLike={branch} issue={issue} togglePopup={jest.fn()} />
  );
  expect(element).toMatchSnapshot();
});

it('should render the titlebar with the filter', () => {
  const element = shallow(
    <IssueTitleBar issue={issue} onFilter={jest.fn()} togglePopup={jest.fn()} />
  );
  expect(element).toMatchSnapshot();
});

it('should count all code locations', () => {
  const element = shallow(
    <IssueTitleBar
      displayLocationsCount={true}
      issue={issueWithLocations}
      togglePopup={jest.fn()}
    />
  );
  expect(element.find('LocationIndex')).toMatchSnapshot();
});
