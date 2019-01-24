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
import * as classNames from 'classnames';
import UpgradeOrganizationBox from '../../components/common/UpgradeOrganizationBox';
import Modal from '../../components/controls/Modal';
import { Organization, Visibility } from '../../app/types';
import { Button, ResetButtonLink } from '../../components/ui/buttons';
import { translate } from '../../helpers/l10n';
import { Alert } from '../../components/ui/Alert';

export interface Props {
  onClose: () => void;
  onConfirm: (visiblity: Visibility) => void;
  organization: Organization;
}

interface State {
  visibility: Visibility;
}

export default class ChangeVisibilityForm extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { visibility: props.organization.projectVisibility as Visibility };
  }

  handleConfirmClick = () => {
    this.props.onConfirm(this.state.visibility);
    this.props.onClose();
  };

  handleVisibilityClick = (event: React.SyntheticEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.currentTarget.blur();
    const visibility = event.currentTarget.dataset.visibility as Visibility;
    this.setState({ visibility });
  };

  render() {
    const { organization } = this.props;
    return (
      <Modal contentLabel="modal form" onRequestClose={this.props.onClose}>
        <header className="modal-head">
          <h2>{translate('organization.change_visibility_form.header')}</h2>
        </header>

        <div className="modal-body">
          {[Visibility.Public, Visibility.Private].map(visibility => (
            <div className="big-spacer-bottom" key={visibility}>
              <p>
                {visibility === Visibility.Private &&
                !organization.canUpdateProjectsVisibilityToPrivate ? (
                  <span className="text-muted cursor-not-allowed">
                    <i
                      className={classNames('icon-radio', 'spacer-right', {
                        'is-checked': this.state.visibility === visibility
                      })}
                    />
                    {translate('visibility', visibility)}
                  </span>
                ) : (
                  <a
                    className="link-base-color link-no-underline"
                    data-visibility={visibility}
                    href="#"
                    onClick={this.handleVisibilityClick}>
                    <i
                      className={classNames('icon-radio', 'spacer-right', {
                        'is-checked': this.state.visibility === visibility
                      })}
                    />
                    {translate('visibility', visibility)}
                  </a>
                )}
              </p>
              <p className="text-muted spacer-top" style={{ paddingLeft: 22 }}>
                {translate('visibility', visibility, 'description.short')}
              </p>
            </div>
          ))}

          {organization.canUpdateProjectsVisibilityToPrivate ? (
            <Alert variant="warning">
              {translate('organization.change_visibility_form.warning')}
            </Alert>
          ) : (
            <UpgradeOrganizationBox organization={this.props.organization.key} />
          )}
        </div>

        <footer className="modal-foot">
          <Button className="js-confirm" onClick={this.handleConfirmClick}>
            {translate('organization.change_visibility_form.submit')}
          </Button>
          <ResetButtonLink className="js-modal-close" onClick={this.props.onClose}>
            {translate('cancel')}
          </ResetButtonLink>
        </footer>
      </Modal>
    );
  }
}
