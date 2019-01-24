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
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InjectedRouter } from 'react-router';
import OnboardingModal from './OnboardingModal';
import { skipOnboarding } from '../../../store/users';
import TeamOnboardingModal from '../teamOnboarding/TeamOnboardingModal';
import { Organization } from '../../../app/types';

interface DispatchProps {
  skipOnboarding: () => void;
}

interface OwnProps {
  router: InjectedRouter;
}

enum ModalKey {
  onboarding,
  teamOnboarding
}

interface State {
  modal?: ModalKey;
}

export class OnboardingPage extends React.PureComponent<OwnProps & DispatchProps, State> {
  static contextTypes = {
    openProjectOnboarding: PropTypes.func.isRequired
  };

  state: State = { modal: ModalKey.onboarding };

  closeOnboarding = () => {
    this.props.skipOnboarding();
    this.props.router.replace('/');
  };

  closeOrganizationOnboarding = ({ key }: Pick<Organization, 'key'>) => {
    this.closeOnboarding();
    this.props.router.push(`/organizations/${key}`);
  };

  openOrganizationOnboarding = () => {
    this.props.router.push({ pathname: '/create-organization', state: { paid: true } });
  };

  openTeamOnboarding = () => {
    this.setState({ modal: ModalKey.teamOnboarding });
  };

  render() {
    const { modal } = this.state;
    return (
      <>
        {modal === ModalKey.onboarding && (
          <OnboardingModal
            onClose={this.closeOnboarding}
            onOpenOrganizationOnboarding={this.openOrganizationOnboarding}
            onOpenProjectOnboarding={this.context.openProjectOnboarding}
            onOpenTeamOnboarding={this.openTeamOnboarding}
          />
        )}
        {modal === ModalKey.teamOnboarding && (
          <TeamOnboardingModal onFinish={this.closeOnboarding} />
        )}
      </>
    );
  }
}

const mapDispatchToProps: DispatchProps = { skipOnboarding };

export default connect(
  null,
  mapDispatchToProps
)(OnboardingPage);
