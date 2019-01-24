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
import { times } from 'lodash';
import { Location } from 'history';
import { shallow } from 'enzyme';
import { CreateOrganization } from '../CreateOrganization';
import { mockRouter, waitAndUpdate } from '../../../../helpers/testUtils';
import { LoggedInUser } from '../../../../app/types';
import {
  getAlmAppInfo,
  getAlmOrganization,
  listUnboundApplications
} from '../../../../api/alm-integration';
import { getSubscriptionPlans } from '../../../../api/billing';
import { getOrganizations } from '../../../../api/organizations';
import { get, remove } from '../../../../helpers/storage';

jest.mock('../../../../api/billing', () => ({
  getSubscriptionPlans: jest
    .fn()
    .mockResolvedValue([{ maxNcloc: 100000, price: 10 }, { maxNcloc: 250000, price: 75 }])
}));

jest.mock('../../../../api/alm-integration', () => ({
  getAlmAppInfo: jest.fn().mockResolvedValue({
    application: {
      backgroundColor: 'blue',
      iconPath: 'icon/path',
      installationUrl: 'https://alm.installation.url',
      key: 'github',
      name: 'GitHub'
    }
  }),
  getAlmOrganization: jest.fn().mockResolvedValue({
    almOrganization: {
      avatar: 'my-avatar',
      description: 'Continuous Code Quality',
      key: 'sonarsource',
      name: 'SonarSource',
      personal: false,
      url: 'https://www.sonarsource.com'
    }
  }),
  listUnboundApplications: jest.fn().mockResolvedValue([])
}));

jest.mock('../../../../api/organizations', () => ({
  getOrganizations: jest.fn().mockResolvedValue({ organizations: [] })
}));

jest.mock('../../../../helpers/storage', () => ({
  get: jest.fn().mockReturnValue(undefined),
  remove: jest.fn()
}));

const user: LoggedInUser = {
  groups: [],
  isLoggedIn: true,
  login: 'luke',
  name: 'Skywalker',
  scmAccounts: [],
  showOnboardingTutorial: false
};

beforeEach(() => {
  (getAlmAppInfo as jest.Mock<any>).mockClear();
  (getAlmOrganization as jest.Mock<any>).mockClear();
  (listUnboundApplications as jest.Mock<any>).mockClear();
  (getSubscriptionPlans as jest.Mock<any>).mockClear();
  (getOrganizations as jest.Mock<any>).mockClear();
  (get as jest.Mock<any>).mockClear();
  (remove as jest.Mock<any>).mockClear();
});

it('should render with manual tab displayed', async () => {
  const wrapper = shallowRender();
  await waitAndUpdate(wrapper);
  expect(wrapper).toMatchSnapshot();
  expect(getSubscriptionPlans).toHaveBeenCalled();
  expect(getAlmAppInfo).not.toHaveBeenCalled();
});

it('should preselect paid plan on manual creation', async () => {
  const location = { state: { paid: true } };
  // @ts-ignore avoid passing everything from WithRouterProps
  const wrapper = shallowRender({ location });
  await waitAndUpdate(wrapper);
  expect(wrapper.find('ManualOrganizationCreate').prop('onlyPaid')).toBe(true);
});

it('should render with auto tab displayed', async () => {
  const wrapper = shallowRender({ currentUser: { ...user, externalProvider: 'github' } });
  await waitAndUpdate(wrapper);
  expect(wrapper).toMatchSnapshot();
  expect(getAlmAppInfo).toHaveBeenCalled();
  expect(listUnboundApplications).toHaveBeenCalled();
});

it('should render with auto tab selected and manual disabled', async () => {
  const wrapper = shallowRender({
    currentUser: { ...user, externalProvider: 'github' },
    location: { query: { installation_id: 'foo' } } as Location
  });
  expect(wrapper).toMatchSnapshot();
  await waitAndUpdate(wrapper);
  expect(wrapper).toMatchSnapshot();
  expect(getAlmAppInfo).toHaveBeenCalled();
  expect(getAlmOrganization).toHaveBeenCalled();
  expect(getOrganizations).toHaveBeenCalled();
});

it('should render with auto personal organization bind page', async () => {
  (getAlmOrganization as jest.Mock<any>).mockResolvedValueOnce({
    almOrganization: {
      key: 'foo',
      name: 'Foo',
      avatar: 'my-avatar',
      personal: true
    }
  });
  const wrapper = shallowRender({
    currentUser: { ...user, externalProvider: 'github', personalOrganization: 'foo' },
    location: { query: { installation_id: 'foo' } } as Location
  });
  expect(wrapper).toMatchSnapshot();
  await waitAndUpdate(wrapper);
  expect(wrapper).toMatchSnapshot();
});

it('should slugify and find a uniq organization key', async () => {
  (getAlmOrganization as jest.Mock<any>).mockResolvedValueOnce({
    almOrganization: {
      avatar: 'https://avatars3.githubusercontent.com/u/37629810?v=4',
      key: 'Foo&Bar',
      name: 'Foo & Bar',
      personal: true
    }
  });
  (getOrganizations as jest.Mock<any>).mockResolvedValueOnce({
    organizations: [{ key: 'foo-and-bar' }, { key: 'foo-and-bar-1' }]
  });
  const wrapper = shallowRender({
    currentUser: { ...user, externalProvider: 'github' },
    location: { query: { installation_id: 'foo' } } as Location
  });
  await waitAndUpdate(wrapper);
  expect(getOrganizations).toHaveBeenCalledWith({
    organizations: ['foo-and-bar', ...times(9, i => `foo-and-bar-${i + 1}`)].join(',')
  });
  expect(wrapper.find('AutoOrganizationCreate').prop('almOrganization')).toMatchObject({
    key: 'foo-and-bar-2'
  });
});

it('should switch tabs', async () => {
  const replace = jest.fn();
  const wrapper = shallowRender({
    currentUser: { ...user, externalProvider: 'github' },
    router: mockRouter({ replace })
  });

  replace.mockImplementation(location => {
    wrapper.setProps({ location }).update();
  });

  await waitAndUpdate(wrapper);
  expect(wrapper).toMatchSnapshot();

  (wrapper.find('Tabs').prop('onChange') as Function)('manual');
  expect(wrapper.find('ManualOrganizationCreate').hasClass('hidden')).toBeFalsy();
  expect(wrapper.find('AutoOrganizationCreate').hasClass('hidden')).toBeTruthy();
  (wrapper.find('Tabs').prop('onChange') as Function)('auto');
  expect(wrapper.find('AutoOrganizationCreate').hasClass('hidden')).toBeFalsy();
  expect(wrapper.find('ManualOrganizationCreate').hasClass('hidden')).toBeTruthy();
});

it('should reload the alm organization when the url query changes', async () => {
  const wrapper = shallowRender({ currentUser: { ...user, externalProvider: 'github' } });
  await waitAndUpdate(wrapper);
  expect(getAlmOrganization).not.toHaveBeenCalled();
  wrapper.setProps({ location: { query: { installation_id: 'foo' } } });
  expect(getAlmOrganization).toHaveBeenCalledWith({ installationId: 'foo' });
  wrapper.setProps({ location: { query: {} } });
  expect(wrapper.state('almOrganization')).toBeUndefined();
  expect(listUnboundApplications).toHaveBeenCalledTimes(2);
});

it('should redirect to organization page after creation', async () => {
  const push = jest.fn();
  const wrapper = shallowRender({ router: mockRouter({ push }) });
  await waitAndUpdate(wrapper);

  wrapper.find('ManualOrganizationCreate').prop<Function>('onOrgCreated')('foo');
  expect(push).toHaveBeenCalledWith({
    pathname: '/organizations/foo',
    state: { justCreated: true }
  });

  (get as jest.Mock<any>).mockReturnValueOnce('0');
  wrapper.find('ManualOrganizationCreate').prop<Function>('onOrgCreated')('foo', false);
  expect(push).toHaveBeenCalledWith({
    pathname: '/organizations/foo',
    state: { justCreated: false }
  });
});

it('should redirect to projects creation page after creation', async () => {
  const push = jest.fn();
  const wrapper = shallowRender({ router: mockRouter({ push }) });
  await waitAndUpdate(wrapper);

  (get as jest.Mock<any>).mockReturnValueOnce(Date.now().toString());
  wrapper.find('ManualOrganizationCreate').prop<Function>('onOrgCreated')('foo');
  expect(get).toHaveBeenCalled();
  expect(remove).toHaveBeenCalled();
  expect(push).toHaveBeenCalledWith({
    pathname: '/projects/create',
    state: { organization: 'foo', tab: 'manual' }
  });

  wrapper.setState({ almOrganization: { key: 'foo', name: 'Foo', avatar: 'my-avatar' } });
  (get as jest.Mock<any>).mockReturnValueOnce(Date.now().toString());
  wrapper.find('ManualOrganizationCreate').prop<Function>('onOrgCreated')('foo');
  expect(push).toHaveBeenCalledWith({
    pathname: '/projects/create',
    state: { organization: 'foo', tab: 'auto' }
  });
});

it('should display AutoOrganizationCreate with already bound organization', async () => {
  (getAlmOrganization as jest.Mock<any>).mockResolvedValueOnce({
    almOrganization: {
      avatar: 'https://avatars3.githubusercontent.com/u/37629810?v=4',
      key: 'Foo&Bar',
      name: 'Foo & Bar',
      personal: true
    },
    boundOrganization: { key: 'foobar', name: 'Foo & Bar' }
  });
  (get as jest.Mock<any>).mockReturnValueOnce(Date.now().toString());
  const push = jest.fn();
  const wrapper = shallowRender({
    currentUser: { ...user, externalProvider: 'github' },
    location: { query: { installation_id: 'foo' } } as Location,
    router: mockRouter({ push })
  });
  await waitAndUpdate(wrapper);
  expect(get).toHaveBeenCalled();
  expect(remove).toHaveBeenCalled();
  expect(getAlmOrganization).toHaveBeenCalledWith({ installationId: 'foo' });
  expect(push).not.toHaveBeenCalled();
  expect(wrapper.find('AutoOrganizationCreate').prop('boundOrganization')).toEqual({
    key: 'foobar',
    name: 'Foo & Bar'
  });
});

it('should redirect to org page when already bound and no binding in progress', async () => {
  (getAlmOrganization as jest.Mock<any>).mockResolvedValueOnce({
    almOrganization: {
      avatar: 'https://avatars3.githubusercontent.com/u/37629810?v=4',
      key: 'Foo&Bar',
      name: 'Foo & Bar',
      personal: true
    },
    boundOrganization: { key: 'foobar', name: 'Foo & Bar' }
  });
  const push = jest.fn();
  const wrapper = shallowRender({
    currentUser: { ...user, externalProvider: 'github' },
    location: { query: { installation_id: 'foo' } } as Location,
    router: mockRouter({ push })
  });
  await waitAndUpdate(wrapper);
  expect(getAlmOrganization).toHaveBeenCalledWith({ installationId: 'foo' });
  expect(push).toHaveBeenCalledWith({ pathname: '/organizations/foobar' });
});

function shallowRender(props: Partial<CreateOrganization['props']> = {}) {
  return shallow(
    <CreateOrganization
      createOrganization={jest.fn()}
      currentUser={user}
      deleteOrganization={jest.fn()}
      // @ts-ignore avoid passing everything from WithRouterProps
      location={{}}
      router={mockRouter()}
      skipOnboarding={jest.fn()}
      updateOrganization={jest.fn()}
      userOrganizations={[
        { actions: { admin: true }, key: 'foo', name: 'Foo' },
        { actions: { admin: true }, alm: { key: 'github', url: '' }, key: 'bar', name: 'Bar' },
        { actions: { admin: false }, key: 'baz', name: 'Baz' }
      ]}
      {...props}
    />
  );
}
