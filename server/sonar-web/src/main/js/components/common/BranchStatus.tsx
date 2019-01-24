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
import StatusIndicator from './StatusIndicator';
import Level from '../ui/Level';
import BugIcon from '../icons-components/BugIcon';
import CodeSmellIcon from '../icons-components/CodeSmellIcon';
import HelpTooltip from '../controls/HelpTooltip';
import Tooltip from '../controls/Tooltip';
import VulnerabilityIcon from '../icons-components/VulnerabilityIcon';
import { BranchLike } from '../../app/types';
import {
  getBranchQualityGateColor,
  isShortLivingBranch,
  isPullRequest,
  isLongLivingBranch,
  isMainBranch
} from '../../helpers/branches';
import { translateWithParameters } from '../../helpers/l10n';
import { formatMeasure } from '../../helpers/measures';
import './BranchStatus.css';

interface Props {
  branchLike: BranchLike;
  concise?: boolean;
  helpTooltipClassName?: string;
}

export default function BranchStatus({ branchLike, concise = false, helpTooltipClassName }: Props) {
  if (isShortLivingBranch(branchLike) || isPullRequest(branchLike)) {
    if (!branchLike.status) {
      return null;
    }

    const totalIssues =
      branchLike.status.bugs + branchLike.status.vulnerabilities + branchLike.status.codeSmells;
    const status = branchLike.status.qualityGateStatus;
    const indicatorColor = getBranchQualityGateColor(status);
    const shouldDisplayHelper = status === 'OK' && totalIssues > 0;

    const label =
      translateWithParameters('overview.quality_gate_x', formatMeasure(status, 'LEVEL')) +
      (status !== 'OK'
        ? ' ' + translateWithParameters('overview.quality_gate_failed_with_x', totalIssues)
        : '');

    return concise ? (
      <Tooltip overlay={label} placement="right">
        <ul className="branch-status">
          <li>{totalIssues}</li>
          <li className="spacer-left">
            <StatusIndicator color={indicatorColor} size="small" />
          </li>
        </ul>
      </Tooltip>
    ) : (
      <ul className="branch-status">
        <li className="little-spacer-right">
          <StatusIndicator color={indicatorColor} size="small" />
        </li>
        <li className="spacer-left">
          {branchLike.status.bugs}
          <BugIcon className="little-spacer-left" />
        </li>
        <li className="spacer-left">
          {branchLike.status.vulnerabilities}
          <VulnerabilityIcon className="little-spacer-left" />
        </li>
        <li className="spacer-left">
          {branchLike.status.codeSmells}
          <CodeSmellIcon className="little-spacer-left" />
        </li>
        {shouldDisplayHelper && (
          <HelpTooltip
            className={classNames('spacer-left', helpTooltipClassName)}
            overlay={translateWithParameters(
              'branches.short_lived.quality_gate.description',
              totalIssues
            )}
            tagName="li"
          />
        )}
      </ul>
    );
  } else if (isLongLivingBranch(branchLike) || isMainBranch(branchLike)) {
    if (!branchLike.status) {
      return null;
    }

    return <Level level={branchLike.status.qualityGateStatus} small={true} />;
  }
  return null;
}
