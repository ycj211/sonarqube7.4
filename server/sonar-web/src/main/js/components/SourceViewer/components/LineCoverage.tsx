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
import CoveragePopup from './CoveragePopup';
import { BranchLike, SourceLine } from '../../../app/types';
import Tooltip from '../../controls/Tooltip';
import Toggler from '../../controls/Toggler';
import { translate } from '../../../helpers/l10n';

interface Props {
  branchLike: BranchLike | undefined;
  componentKey: string;
  line: SourceLine;
  onPopupToggle: (x: { index?: number; line: number; name: string; open?: boolean }) => void;
  popupOpen: boolean;
}

export default class LineCoverage extends React.PureComponent<Props> {
  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.blur();
    this.props.onPopupToggle({ line: this.props.line.line, name: 'coverage' });
  };

  handleTogglePopup = (open: boolean) => {
    this.props.onPopupToggle({ line: this.props.line.line, name: 'coverage', open });
  };

  closePopup = () => {
    this.props.onPopupToggle({ line: this.props.line.line, name: 'coverage', open: false });
  };

  render() {
    const { branchLike, componentKey, line, popupOpen } = this.props;

    const className =
      'source-meta source-line-coverage' +
      (line.coverageStatus != null ? ` source-line-${line.coverageStatus}` : '');

    const hasPopup =
      line.coverageStatus === 'covered' || line.coverageStatus === 'partially-covered';

    const bar = hasPopup ? (
      <div className="source-line-bar" onClick={this.handleClick} role="button" tabIndex={0} />
    ) : (
      <div className="source-line-bar" />
    );

    const cell = line.coverageStatus ? (
      <Tooltip
        overlay={popupOpen ? undefined : translate('source_viewer.tooltip', line.coverageStatus)}
        placement="right">
        {bar}
      </Tooltip>
    ) : (
      bar
    );

    if (hasPopup) {
      return (
        <td className={className} data-line-number={line.line}>
          <Toggler
            onRequestClose={this.closePopup}
            open={popupOpen}
            overlay={
              <CoveragePopup
                branchLike={branchLike}
                componentKey={componentKey}
                line={line}
                onClose={this.closePopup}
              />
            }>
            {cell}
          </Toggler>
        </td>
      );
    }

    return (
      <td className={className} data-line-number={line.line}>
        {cell}
      </td>
    );
  }
}
