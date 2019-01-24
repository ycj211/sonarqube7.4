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
import RuleListItem from '../RuleListItem';
import { Rule, RuleType } from '../../../../app/types';
import { mockEvent } from '../../../../helpers/testUtils';

const rule: Rule = {
  key: 'foo',
  lang: 'js',
  langName: 'JavaScript',
  name: 'Use foo',
  severity: 'MAJOR',
  status: 'READY',
  sysTags: ['a', 'b'],
  tags: ['x'],
  type: RuleType.CodeSmell
};

it('should render', () => {
  expect(shallowRender()).toMatchSnapshot();
});

it('should open rule', () => {
  const onOpen = jest.fn();
  const wrapper = shallowRender({ onOpen });
  wrapper.find('Link').prop<Function>('onClick')({ ...mockEvent, button: 0 });
  expect(onOpen).toBeCalledWith('foo');
});

function shallowRender(props?: Partial<RuleListItem['props']>) {
  return shallow(
    <RuleListItem
      onActivate={jest.fn()}
      onDeactivate={jest.fn()}
      onFilterChange={jest.fn()}
      onOpen={jest.fn()}
      organization="org"
      rule={rule}
      selected={false}
      {...props}
    />
  );
}
