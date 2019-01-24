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
import Helmet from 'react-helmet';
import { without } from 'lodash';
import AllHoldersList from './AllHoldersList';
import PageHeader from './PageHeader';
import PublicProjectDisclaimer from './PublicProjectDisclaimer';
import UpgradeOrganizationBox from '../../../../components/common/UpgradeOrganizationBox';
import VisibilitySelector from '../../../../components/common/VisibilitySelector';
import * as api from '../../../../api/permissions';
import { translate } from '../../../../helpers/l10n';
import {
  Component,
  Paging,
  PermissionGroup,
  PermissionUser,
  Visibility
} from '../../../../app/types';
import '../../styles.css';

interface Props {
  component: Component;
  onComponentChange: (changes: Partial<Component>) => void;
}

interface State {
  disclaimer: boolean;
  filter: string;
  groups: PermissionGroup[];
  groupsPaging?: Paging;
  loading: boolean;
  query: string;
  selectedPermission?: string;
  users: PermissionUser[];
  usersPaging?: Paging;
}

export default class App extends React.PureComponent<Props, State> {
  mounted = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      disclaimer: false,
      filter: 'all',
      groups: [],
      loading: true,
      query: '',
      users: []
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadHolders();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  stopLoading = () => {
    if (this.mounted) {
      this.setState({ loading: false });
    }
  };

  loadUsersAndGroups = (userPage?: number, groupsPage?: number) => {
    const { component } = this.props;
    const { filter, query, selectedPermission } = this.state;

    const getUsers: Promise<{ paging?: Paging; users: PermissionUser[] }> =
      filter !== 'groups'
        ? api.getPermissionsUsersForComponent({
            projectKey: component.key,
            q: query || undefined,
            permission: selectedPermission,
            organization: component.organization,
            p: userPage
          })
        : Promise.resolve({ paging: undefined, users: [] });

    const getGroups: Promise<{ paging?: Paging; groups: PermissionGroup[] }> =
      filter !== 'users'
        ? api.getPermissionsGroupsForComponent({
            projectKey: component.key,
            q: query || undefined,
            permission: selectedPermission,
            organization: component.organization,
            p: groupsPage
          })
        : Promise.resolve({ paging: undefined, groups: [] });

    return Promise.all([getUsers, getGroups]);
  };

  loadHolders = () => {
    this.setState({ loading: true });
    return this.loadUsersAndGroups().then(([usersResponse, groupsResponse]) => {
      if (this.mounted) {
        this.setState({
          groups: groupsResponse.groups,
          groupsPaging: groupsResponse.paging,
          loading: false,
          users: usersResponse.users,
          usersPaging: usersResponse.paging
        });
      }
    }, this.stopLoading);
  };

  onLoadMore = () => {
    const { usersPaging, groupsPaging } = this.state;
    this.setState({ loading: true });
    return this.loadUsersAndGroups(
      usersPaging ? usersPaging.pageIndex + 1 : 1,
      groupsPaging ? groupsPaging.pageIndex + 1 : 1
    ).then(([usersResponse, groupsResponse]) => {
      if (this.mounted) {
        this.setState(({ groups, users }) => ({
          groups: [...groups, ...groupsResponse.groups],
          groupsPaging: groupsResponse.paging,
          loading: false,
          users: [...users, ...usersResponse.users],
          usersPaging: usersResponse.paging
        }));
      }
    }, this.stopLoading);
  };

  handleFilterChange = (filter: string) => {
    if (this.mounted) {
      this.setState({ filter }, this.loadHolders);
    }
  };

  handleQueryChange = (query: string) => {
    if (this.mounted) {
      this.setState({ query }, this.loadHolders);
    }
  };

  handlePermissionSelect = (selectedPermission?: string) => {
    if (this.mounted) {
      this.setState(
        (state: State) => ({
          selectedPermission:
            state.selectedPermission === selectedPermission ? undefined : selectedPermission
        }),
        this.loadHolders
      );
    }
  };

  addPermissionToGroup = (group: string, permission: string) => {
    return this.state.groups.map(
      candidate =>
        candidate.name === group
          ? { ...candidate, permissions: [...candidate.permissions, permission] }
          : candidate
    );
  };

  addPermissionToUser = (user: string, permission: string) => {
    return this.state.users.map(
      candidate =>
        candidate.login === user
          ? { ...candidate, permissions: [...candidate.permissions, permission] }
          : candidate
    );
  };

  removePermissionFromGroup = (group: string, permission: string) => {
    return this.state.groups.map(
      candidate =>
        candidate.name === group
          ? { ...candidate, permissions: without(candidate.permissions, permission) }
          : candidate
    );
  };

  removePermissionFromUser = (user: string, permission: string) => {
    return this.state.users.map(
      candidate =>
        candidate.login === user
          ? { ...candidate, permissions: without(candidate.permissions, permission) }
          : candidate
    );
  };

  grantPermissionToGroup = (group: string, permission: string) => {
    if (this.mounted) {
      this.setState({
        loading: true,
        groups: this.addPermissionToGroup(group, permission)
      });
      return api
        .grantPermissionToGroup({
          projectKey: this.props.component.key,
          groupName: group,
          permission,
          organization: this.props.component.organization
        })
        .then(this.stopLoading, () => {
          if (this.mounted) {
            this.setState({
              loading: false,
              groups: this.removePermissionFromGroup(group, permission)
            });
          }
        });
    }
    return Promise.resolve();
  };

  grantPermissionToUser = (user: string, permission: string) => {
    if (this.mounted) {
      this.setState({
        loading: true,
        users: this.addPermissionToUser(user, permission)
      });
      return api
        .grantPermissionToUser({
          projectKey: this.props.component.key,
          login: user,
          permission,
          organization: this.props.component.organization
        })
        .then(this.stopLoading, () => {
          if (this.mounted) {
            this.setState({
              loading: false,
              users: this.removePermissionFromUser(user, permission)
            });
          }
        });
    }
    return Promise.resolve();
  };

  revokePermissionFromGroup = (group: string, permission: string) => {
    if (this.mounted) {
      this.setState({
        loading: true,
        groups: this.removePermissionFromGroup(group, permission)
      });
      return api
        .revokePermissionFromGroup({
          projectKey: this.props.component.key,
          groupName: group,
          permission,
          organization: this.props.component.organization
        })
        .then(this.stopLoading, () => {
          if (this.mounted) {
            this.setState({
              loading: false,
              groups: this.addPermissionToGroup(group, permission)
            });
          }
        });
    }
    return Promise.resolve();
  };

  revokePermissionFromUser = (user: string, permission: string) => {
    if (this.mounted) {
      this.setState({
        loading: true,
        users: this.removePermissionFromUser(user, permission)
      });
      return api
        .revokePermissionFromUser({
          projectKey: this.props.component.key,
          login: user,
          permission,
          organization: this.props.component.organization
        })
        .then(this.stopLoading, () => {
          if (this.mounted) {
            this.setState({
              loading: false,
              users: this.addPermissionToUser(user, permission)
            });
          }
        });
    }
    return Promise.resolve();
  };

  handleVisibilityChange = (visibility: string) => {
    if (visibility === Visibility.Public) {
      this.openDisclaimer();
    } else {
      this.turnProjectToPrivate();
    }
  };

  turnProjectToPublic = () => {
    this.props.onComponentChange({ visibility: Visibility.Public });
    api.changeProjectVisibility(this.props.component.key, Visibility.Public).then(
      () => {
        this.loadHolders();
      },
      () => {
        this.props.onComponentChange({
          visibility: Visibility.Private
        });
      }
    );
  };

  turnProjectToPrivate = () => {
    this.props.onComponentChange({ visibility: Visibility.Private });
    api.changeProjectVisibility(this.props.component.key, Visibility.Private).then(
      () => {
        this.loadHolders();
      },
      () => {
        this.props.onComponentChange({
          visibility: Visibility.Public
        });
      }
    );
  };

  openDisclaimer = () => {
    if (this.mounted) {
      this.setState({ disclaimer: true });
    }
  };

  closeDisclaimer = () => {
    if (this.mounted) {
      this.setState({ disclaimer: false });
    }
  };

  render() {
    const canTurnToPrivate =
      this.props.component.configuration != null &&
      this.props.component.configuration.canUpdateProjectVisibilityToPrivate;

    return (
      <div className="page page-limited" id="project-permissions-page">
        <Helmet title={translate('permissions.page')} />

        <PageHeader
          component={this.props.component}
          loadHolders={this.loadHolders}
          loading={this.state.loading}
        />
        <div>
          <VisibilitySelector
            canTurnToPrivate={canTurnToPrivate}
            className="big-spacer-top big-spacer-bottom"
            onChange={this.handleVisibilityChange}
            visibility={this.props.component.visibility}
          />
          {this.props.component.qualifier === 'TRK' &&
            !canTurnToPrivate && (
              <UpgradeOrganizationBox organization={this.props.component.organization} />
            )}
          {this.state.disclaimer && (
            <PublicProjectDisclaimer
              component={this.props.component}
              onClose={this.closeDisclaimer}
              onConfirm={this.turnProjectToPublic}
            />
          )}
        </div>
        <AllHoldersList
          component={this.props.component}
          filter={this.state.filter}
          grantPermissionToGroup={this.grantPermissionToGroup}
          grantPermissionToUser={this.grantPermissionToUser}
          groups={this.state.groups}
          groupsPaging={this.state.groupsPaging}
          onFilterChange={this.handleFilterChange}
          onLoadMore={this.onLoadMore}
          onPermissionSelect={this.handlePermissionSelect}
          onQueryChange={this.handleQueryChange}
          query={this.state.query}
          revokePermissionFromGroup={this.revokePermissionFromGroup}
          revokePermissionFromUser={this.revokePermissionFromUser}
          selectedPermission={this.state.selectedPermission}
          users={this.state.users}
          usersPaging={this.state.usersPaging}
          visibility={this.props.component.visibility}
        />
      </div>
    );
  }
}
