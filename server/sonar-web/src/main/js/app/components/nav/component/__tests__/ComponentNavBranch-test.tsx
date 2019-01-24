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
import ComponentNavBranch from '../ComponentNavBranch';
import {
  BranchType,
  ShortLivingBranch,
  MainBranch,
  Component,
  LongLivingBranch,
  PullRequest
} from '../../../../types';
import { click } from '../../../../../helpers/testUtils';
import { isSonarCloud } from '../../../../../helpers/system';

jest.mock('../../../../../helpers/system', () => ({ isSonarCloud: jest.fn() }));

const mainBranch: MainBranch = { isMain: true, name: 'master' };
const fooBranch: LongLivingBranch = { isMain: false, name: 'foo', type: BranchType.LONG };

beforeEach(() => {
  (isSonarCloud as jest.Mock).mockImplementation(() => false);
});

it('renders main branch', () => {
  const component = {} as Component;
  expect(
    shallow(
      <ComponentNavBranch
        branchLikes={[mainBranch, fooBranch]}
        component={component}
        currentBranchLike={mainBranch}
      />,
      { context: { branchesEnabled: true, canAdmin: true } }
    )
  ).toMatchSnapshot();
});

it('renders short-living branch', () => {
  const branch: ShortLivingBranch = {
    isMain: false,
    mergeBranch: 'master',
    name: 'foo',
    status: { bugs: 0, codeSmells: 0, qualityGateStatus: 'OK', vulnerabilities: 0 },
    type: BranchType.SHORT
  };
  const component = {} as Component;
  expect(
    shallow(
      <ComponentNavBranch
        branchLikes={[branch, fooBranch]}
        component={component}
        currentBranchLike={branch}
      />,
      { context: { branchesEnabled: true, canAdmin: true } }
    )
  ).toMatchSnapshot();
});

it('renders pull request', () => {
  const pullRequest: PullRequest = {
    base: 'master',
    branch: 'feature',
    key: '1234',
    title: 'Feature PR',
    url: 'https://example.com/pull/1234'
  };
  const component = {} as Component;
  expect(
    shallow(
      <ComponentNavBranch
        branchLikes={[pullRequest, fooBranch]}
        component={component}
        currentBranchLike={pullRequest}
      />,
      { context: { branchesEnabled: true, canAdmin: true } }
    )
  ).toMatchSnapshot();
});

it('opens menu', () => {
  const component = {} as Component;
  const wrapper = shallow(
    <ComponentNavBranch
      branchLikes={[mainBranch, fooBranch]}
      component={component}
      currentBranchLike={mainBranch}
    />,
    { context: { branchesEnabled: true, canAdmin: true } }
  );
  expect(wrapper.find('Toggler').prop('open')).toBe(false);
  click(wrapper.find('a'));
  expect(wrapper.find('Toggler').prop('open')).toBe(true);
});

it('renders single branch popup', () => {
  const component = {} as Component;
  const wrapper = shallow(
    <ComponentNavBranch
      branchLikes={[mainBranch]}
      component={component}
      currentBranchLike={mainBranch}
    />,
    { context: { branchesEnabled: true, canAdmin: true } }
  );
  expect(wrapper.find('DocTooltip')).toMatchSnapshot();
});

it('renders no branch support popup', () => {
  const component = {} as Component;
  const wrapper = shallow(
    <ComponentNavBranch
      branchLikes={[mainBranch, fooBranch]}
      component={component}
      currentBranchLike={mainBranch}
    />,
    { context: { branchesEnabled: false, canAdmin: true } }
  );
  expect(wrapper.find('DocTooltip')).toMatchSnapshot();
});

it('renders nothing on SonarCloud without branch support', () => {
  (isSonarCloud as jest.Mock).mockImplementation(() => true);
  const component = {} as Component;
  const wrapper = shallow(
    <ComponentNavBranch
      branchLikes={[mainBranch]}
      component={component}
      currentBranchLike={mainBranch}
    />,
    { context: { branchesEnabled: false, onSonarCloud: true, canAdmin: true } }
  );
  expect(wrapper.type()).toBeNull();
});
