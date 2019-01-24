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
import BranchStatus from '../BranchStatus';
import { BranchType, LongLivingBranch, ShortLivingBranch, MainBranch } from '../../../app/types';

it('renders status of short-living branches', () => {
  checkShort('OK', 0, 0, 0);
  checkShort('WARN', 0, 1, 0);
  checkShort('ERROR', 7, 3, 6);
  checkShort('OK', 0, 0, 1);

  function checkShort(
    qualityGateStatus: string,
    bugs: number,
    codeSmells: number,
    vulnerabilities: number
  ) {
    const shortBranch: ShortLivingBranch = {
      isMain: false,
      mergeBranch: 'master',
      name: 'foo',
      status: { bugs, codeSmells, qualityGateStatus, vulnerabilities },
      type: BranchType.SHORT
    };
    expect(shallow(<BranchStatus branchLike={shortBranch} />)).toMatchSnapshot();
  }
});

it('renders status of long-living branches', () => {
  const branch: LongLivingBranch = { isMain: false, name: 'foo', type: BranchType.LONG };
  expect(getWrapper(branch).type()).toBeNull();
  expect(getWrapper(branch, 'OK')).toMatchSnapshot();
  expect(getWrapper(branch, 'ERROR')).toMatchSnapshot();
});

it('renders status of main branch', () => {
  const branch: MainBranch = { isMain: true, name: 'foo' };
  expect(getWrapper(branch).type()).toBeNull();
  expect(getWrapper(branch, 'OK')).toMatchSnapshot();
  expect(getWrapper(branch, 'ERROR')).toMatchSnapshot();
});

function getWrapper(branch: MainBranch | LongLivingBranch, qualityGateStatus?: string) {
  if (qualityGateStatus) {
    branch.status = { qualityGateStatus };
  }
  return shallow(<BranchStatus branchLike={branch} />);
}
