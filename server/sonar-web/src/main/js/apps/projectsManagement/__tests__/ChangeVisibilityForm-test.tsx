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
import ChangeVisibilityForm from '../ChangeVisibilityForm';
import { click } from '../../../helpers/testUtils';
import { Visibility } from '../../../app/types';

const organization = {
  canUpdateProjectsVisibilityToPrivate: true,
  key: 'org',
  name: 'org',
  projectVisibility: Visibility.Public
};

it('renders disabled', () => {
  expect(
    shallowRender({
      organization: { ...organization, canUpdateProjectsVisibilityToPrivate: false }
    })
  ).toMatchSnapshot();
});

it('closes', () => {
  const onClose = jest.fn();
  const wrapper = shallowRender({ onClose });
  click(wrapper.find('.js-modal-close'));
  expect(onClose).toBeCalled();
});

it('changes visibility', () => {
  const onConfirm = jest.fn();
  const wrapper = shallowRender({ onConfirm });
  expect(wrapper).toMatchSnapshot();

  click(wrapper.find('a[data-visibility="private"]'), {
    currentTarget: {
      blur() {},
      dataset: { visibility: Visibility.Private }
    }
  });
  expect(wrapper).toMatchSnapshot();

  click(wrapper.find('.js-confirm'));
  expect(onConfirm).toBeCalledWith(Visibility.Private);
});

function shallowRender(props: Partial<ChangeVisibilityForm['props']> = {}) {
  return shallow(
    <ChangeVisibilityForm
      onClose={jest.fn()}
      onConfirm={jest.fn()}
      organization={organization}
      {...props}
    />
  );
}
