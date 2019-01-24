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
import { Link } from 'react-router';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import DropdownIcon from '../../../components/icons-components/DropdownIcon';
import Dropdown from '../../../components/controls/Dropdown';
import OrganizationListItem from '../../../components/ui/OrganizationListItem';
import { Button } from '../../../components/ui/buttons';
import { getMyOrganizations, Store } from '../../../store/rootReducer';
import { isSonarCloud } from '../../../helpers/system';
import { Organization } from '../../../app/types';
import { translate } from '../../../helpers/l10n';

interface StateProps {
  organizations: Organization[];
}

export class NoFavoriteProjects extends React.PureComponent<StateProps> {
  static contextTypes = {
    openProjectOnboarding: PropTypes.func
  };

  onAnalyzeProjectClick = () => {
    this.context.openProjectOnboarding();
  };

  render() {
    const { organizations } = this.props;
    return (
      <div className="projects-empty-list">
        <h3>{translate('projects.no_favorite_projects')}</h3>
        {isSonarCloud() ? (
          <div className="spacer-top">
            <p>{translate('projects.no_favorite_projects.how_to_add_projects')}</p>
            <div className="huge-spacer-top">
              <Button onClick={this.onAnalyzeProjectClick}>
                {translate('provisioning.analyze_new_project')}
              </Button>

              <Dropdown
                className="display-inline-block big-spacer-left"
                overlay={
                  <ul className="menu">
                    {sortBy(organizations, org => org.name.toLowerCase()).map(organization => (
                      <OrganizationListItem key={organization.key} organization={organization} />
                    ))}
                  </ul>
                }>
                <a className="button" href="#">
                  {translate('projects.no_favorite_projects.favorite_projects_from_orgs')}
                  <DropdownIcon className="little-spacer-left" />
                </a>
              </Dropdown>
              <Link className="button big-spacer-left" to="/explore/projects">
                {translate('projects.no_favorite_projects.favorite_public_projects')}
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="big-spacer-top">
              {translate('projects.no_favorite_projects.engagement')}
            </p>
            <p className="big-spacer-top">
              <Link className="button" to="/projects/all">
                {translate('projects.explore_projects')}
              </Link>
            </p>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: Store): StateProps => ({
  organizations: getMyOrganizations(state)
});

export default connect(mapStateToProps)(NoFavoriteProjects);
