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
import { updateIssue } from '../actions';
import SetTransitionPopup from '../popups/SetTransitionPopup';
import { setIssueTransition } from '../../../api/issues';
import Toggler from '../../controls/Toggler';
import DropdownIcon from '../../icons-components/DropdownIcon';
import StatusHelper from '../../shared/StatusHelper';
import { Button } from '../../ui/buttons';
import { Issue } from '../../../app/types';

interface Props {
  hasTransitions: boolean;
  isOpen: boolean;
  issue: Pick<Issue, 'key' | 'resolution' | 'status' | 'transitions'>;
  onChange: (issue: Issue) => void;
  togglePopup: (popup: string, show?: boolean) => void;
}

export default class IssueTransition extends React.PureComponent<Props> {
  setTransition = (transition: string) => {
    updateIssue(
      this.props.onChange,
      setIssueTransition({ issue: this.props.issue.key, transition })
    );
    this.toggleSetTransition();
  };

  toggleSetTransition = (open?: boolean) => {
    this.props.togglePopup('transition', open);
  };

  handleClose = () => {
    this.toggleSetTransition(false);
  };

  render() {
    const { issue } = this.props;

    if (this.props.hasTransitions) {
      return (
        <div className="dropdown">
          <Toggler
            onRequestClose={this.handleClose}
            open={this.props.isOpen && this.props.hasTransitions}
            overlay={
              <SetTransitionPopup onSelect={this.setTransition} transitions={issue.transitions} />
            }>
            <Button
              className="button-link issue-action issue-action-with-options js-issue-transition"
              onClick={this.toggleSetTransition}>
              <StatusHelper
                className="issue-meta-label"
                resolution={issue.resolution}
                status={issue.status}
              />
              <DropdownIcon className="little-spacer-left" />
            </Button>
          </Toggler>
        </div>
      );
    } else {
      return (
        <StatusHelper
          className="issue-meta-label"
          resolution={issue.resolution}
          status={issue.status}
        />
      );
    }
  }
}
