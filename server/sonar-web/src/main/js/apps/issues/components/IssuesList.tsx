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
import ListItem from './ListItem';
import { Query } from '../utils';
import { BranchLike, Component, Issue } from '../../../app/types';

interface Props {
  branchLike: BranchLike | undefined;
  checked: string[];
  component: Component | undefined;
  issues: Issue[];
  onFilterChange: (changes: Partial<Query>) => void;
  onIssueChange: (issue: Issue) => void;
  onIssueCheck: ((issueKey: string, event: { shiftKey?: boolean }) => void) | undefined;
  onIssueClick: (issueKey: string) => void;
  onPopupToggle: (issue: string, popupName: string, open?: boolean) => void;
  openPopup: { issue: string; name: string } | undefined;
  organization: { key: string } | undefined;
  selectedIssue: Issue | undefined;
}

export default class IssuesList extends React.PureComponent<Props> {
  render() {
    const { branchLike, checked, component, issues, openPopup, selectedIssue } = this.props;

    return (
      <div>
        {issues.map((issue, index) => (
          <ListItem
            branchLike={branchLike}
            checked={checked.includes(issue.key)}
            component={component}
            issue={issue}
            key={issue.key}
            onChange={this.props.onIssueChange}
            onCheck={this.props.onIssueCheck}
            onClick={this.props.onIssueClick}
            onFilterChange={this.props.onFilterChange}
            onPopupToggle={this.props.onPopupToggle}
            openPopup={openPopup && openPopup.issue === issue.key ? openPopup.name : undefined}
            organization={this.props.organization}
            previousIssue={index > 0 ? issues[index - 1] : undefined}
            selected={selectedIssue != null && selectedIssue.key === issue.key}
          />
        ))}
      </div>
    );
  }
}
