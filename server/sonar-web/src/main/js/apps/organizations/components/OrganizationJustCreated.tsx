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
import { withRouter, WithRouterProps } from 'react-router';
import { Organization } from '../../../app/types';
import { Button } from '../../../components/ui/buttons';
import OnboardingProjectIcon from '../../../components/icons-components/OnboardingProjectIcon';
import OnboardingAddMembersIcon from '../../../components/icons-components/OnboardingAddMembersIcon';
import { translate } from '../../../helpers/l10n';
import '../../tutorials/styles.css';
import './OrganizationJustCreated.css';

interface Props {
  organization: Organization;
}

export class OrganizationJustCreated extends React.PureComponent<Props & WithRouterProps> {
  static contextTypes = {
    openProjectOnboarding: () => null
  };

  handleNewProjectClick = () => {
    this.context.openProjectOnboarding(this.props.organization);
  };

  handleAddMembersClick = () => {
    const { organization } = this.props;
    this.props.router.push(`/organizations/${organization.key}/members`);
  };

  render() {
    return (
      <div className="organization-just-created">
        <h3 className="text-center">{translate('onboarding.create_organization.ready')}</h3>
        <div className="onboarding-choices">
          <Button className="onboarding-choice" onClick={this.handleNewProjectClick}>
            <OnboardingProjectIcon className="big-spacer-bottom" />
            <h6 className="onboarding-choice-name">
              {translate('provisioning.analyze_new_project')}
            </h6>
          </Button>
          <Button className="onboarding-choice" onClick={this.handleAddMembersClick}>
            <OnboardingAddMembersIcon />
            <h6 className="onboarding-choice-name">
              {translate('organization.members.add.multiple')}
            </h6>
          </Button>
        </div>
      </div>
    );
  }
}

export default withRouter(OrganizationJustCreated);
