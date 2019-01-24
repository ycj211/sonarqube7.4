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
import { translate } from '../../helpers/l10n';
import { Visibility } from '../../app/types';

interface Props {
  canTurnToPrivate?: boolean;
  className?: string;
  onChange: (visibility: Visibility) => void;
  visibility?: Visibility;
}

export default class VisibilitySelector extends React.PureComponent<Props> {
  handlePublicClick = (event: React.SyntheticEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.currentTarget.blur();
    this.props.onChange(Visibility.Public);
  };

  handlePrivateClick = (event: React.SyntheticEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.currentTarget.blur();
    this.props.onChange(Visibility.Private);
  };

  render() {
    return (
      <div className={this.props.className}>
        <a
          className="link-base-color link-no-underline"
          href="#"
          id="visibility-public"
          onClick={this.handlePublicClick}>
          <i
            className={classNames('icon-radio', {
              'is-checked': this.props.visibility === Visibility.Public
            })}
          />
          <span className="spacer-left">{translate('visibility.public')}</span>
        </a>

        {this.props.canTurnToPrivate ? (
          <a
            className="link-base-color link-no-underline huge-spacer-left"
            href="#"
            id="visibility-private"
            onClick={this.handlePrivateClick}>
            <i
              className={classNames('icon-radio', {
                'is-checked': this.props.visibility === Visibility.Private
              })}
            />
            <span className="spacer-left">{translate('visibility.private')}</span>
          </a>
        ) : (
          <span className="huge-spacer-left text-muted cursor-not-allowed" id="visibility-private">
            <i
              className={classNames('icon-radio', {
                'is-checked': this.props.visibility === Visibility.Private
              })}
            />
            <span className="spacer-left">{translate('visibility.private')}</span>
          </span>
        )}
      </div>
    );
  }
}
