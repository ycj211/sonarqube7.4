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
/* eslint-disable import/order */
import * as React from 'react';
import { shallow } from 'enzyme';
import AllProjects, { Props } from '../AllProjects';
import { get, save } from '../../../../helpers/storage';

jest.mock('../ProjectsList', () => ({
  // eslint-disable-next-line
  default: function ProjectsList() {
    return null;
  }
}));

jest.mock('../PageHeader', () => ({
  // eslint-disable-next-line
  default: function PageHeader() {
    return null;
  }
}));

jest.mock('../PageSidebar', () => ({
  // eslint-disable-next-line
  default: function PageSidebar() {
    return null;
  }
}));

jest.mock('../../utils', () => {
  const utils = require.requireActual('../../utils');
  utils.fetchProjects = jest.fn(() => Promise.resolve({ projects: [] }));
  return utils;
});

jest.mock('../../../../helpers/storage', () => ({
  get: jest.fn(() => null),
  save: jest.fn()
}));

const fetchProjects = require('../../utils').fetchProjects as jest.Mock<any>;

beforeEach(() => {
  (get as jest.Mock<any>).mockImplementation(() => null);
  (save as jest.Mock<any>).mockClear();
  fetchProjects.mockClear();
});

it('renders', () => {
  const wrapper = shallowRender();
  expect(wrapper).toMatchSnapshot();
  wrapper.setState({ query: { view: 'visualizations' } });
  expect(wrapper).toMatchSnapshot();
});

it('fetches projects', () => {
  shallowRender();
  expect(fetchProjects).lastCalledWith(
    {
      coverage: undefined,
      duplications: undefined,
      gate: undefined,
      languages: undefined,
      maintainability: undefined,
      new_coverage: undefined,
      new_duplications: undefined,
      new_lines: undefined,
      new_maintainability: undefined,
      new_reliability: undefined,
      new_security: undefined,
      reliability: undefined,
      search: undefined,
      security: undefined,
      size: undefined,
      sort: undefined,
      tags: undefined,
      view: undefined,
      visualization: undefined
    },
    false,
    undefined
  );
});

it('redirects to the saved search', () => {
  (get as jest.Mock<any>).mockImplementation(
    (key: string) => (key === 'sonarqube.projects.view' ? 'leak' : null)
  );
  const replace = jest.fn();
  shallowRender({}, jest.fn(), replace);
  expect(replace).lastCalledWith({ pathname: '/projects', query: { view: 'leak' } });
});

it('changes sort', () => {
  const push = jest.fn();
  const wrapper = shallowRender({}, push);
  wrapper.find('PageHeader').prop<Function>('onSortChange')('size', false);
  expect(push).lastCalledWith({ pathname: '/projects', query: { sort: 'size' } });
  expect(save).lastCalledWith('sonarqube.projects.sort', 'size', undefined);
});

it('changes perspective to leak', () => {
  const push = jest.fn();
  const wrapper = shallowRender({}, push);
  wrapper.find('PageHeader').prop<Function>('onPerspectiveChange')({ view: 'leak' });
  expect(push).lastCalledWith({
    pathname: '/projects',
    query: { view: 'leak', visualization: undefined }
  });
  expect(save).toHaveBeenCalledWith('sonarqube.projects.sort', undefined, undefined);
  expect(save).toHaveBeenCalledWith('sonarqube.projects.view', 'leak', undefined);
  expect(save).toHaveBeenCalledWith('sonarqube.projects.visualization', undefined, undefined);
});

it('updates sorting when changing perspective from leak', () => {
  const push = jest.fn();
  const wrapper = shallowRender({}, push);
  wrapper.setState({ query: { sort: 'new_coverage', view: 'leak' } });
  wrapper.find('PageHeader').prop<Function>('onPerspectiveChange')({
    view: undefined
  });
  expect(push).lastCalledWith({
    pathname: '/projects',
    query: { sort: 'coverage', view: undefined, visualization: undefined }
  });
  expect(save).toHaveBeenCalledWith('sonarqube.projects.sort', 'coverage', undefined);
  expect(save).toHaveBeenCalledWith('sonarqube.projects.view', undefined, undefined);
  expect(save).toHaveBeenCalledWith('sonarqube.projects.visualization', undefined, undefined);
});

it('changes perspective to risk visualization', () => {
  const push = jest.fn();
  const wrapper = shallowRender({}, push);
  wrapper.find('PageHeader').prop<Function>('onPerspectiveChange')({
    view: 'visualizations',
    visualization: 'risk'
  });
  expect(push).lastCalledWith({
    pathname: '/projects',
    query: { view: 'visualizations', visualization: 'risk' }
  });
  expect(save).toHaveBeenCalledWith('sonarqube.projects.sort', undefined, undefined);
  expect(save).toHaveBeenCalledWith('sonarqube.projects.view', 'visualizations', undefined);
  expect(save).toHaveBeenCalledWith('sonarqube.projects.visualization', 'risk', undefined);
});

function shallowRender(
  props: Partial<Props> = {},
  push: Function = jest.fn(),
  replace: Function = jest.fn()
) {
  const wrapper = shallow(
    <AllProjects
      currentUser={{ isLoggedIn: true }}
      isFavorite={false}
      location={{ pathname: '/projects', query: {} }}
      organization={undefined}
      organizationsEnabled={false}
      {...props}
    />,
    { context: { router: { push, replace } } }
  );
  wrapper.setState({
    loading: false,
    projects: [{ key: 'foo', measures: {}, name: 'Foo' }],
    total: 0
  });
  return wrapper;
}
