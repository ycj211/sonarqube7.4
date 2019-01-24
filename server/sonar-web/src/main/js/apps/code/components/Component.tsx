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
import * as classNames from 'classnames';
import * as React from 'react';
import ComponentName from './ComponentName';
import ComponentMeasure from './ComponentMeasure';
import ComponentLink from './ComponentLink';
import ComponentPin from './ComponentPin';
import { BranchLike, Metric, ComponentMeasure as IComponentMeasure } from '../../../app/types';

const TOP_OFFSET = 200;
const BOTTOM_OFFSET = 10;

interface Props {
  branchLike?: BranchLike;
  canBrowse?: boolean;
  component: IComponentMeasure;
  isLeak: boolean;
  metrics: Metric[];
  previous?: IComponentMeasure;
  rootComponent: IComponentMeasure;
  selected?: boolean;
}

export default class Component extends React.PureComponent<Props> {
  node?: HTMLElement | null;

  componentDidMount() {
    this.handleUpdate();
  }

  componentDidUpdate() {
    this.handleUpdate();
  }

  handleUpdate() {
    const { selected } = this.props;

    // scroll viewport so the current selected component is visible
    if (selected) {
      setTimeout(() => {
        this.handleScroll();
      }, 0);
    }
  }

  handleScroll() {
    if (this.node) {
      const position = this.node.getBoundingClientRect();
      const { top, bottom } = position;
      if (bottom > window.innerHeight - BOTTOM_OFFSET) {
        window.scrollTo(0, bottom - window.innerHeight + window.pageYOffset + BOTTOM_OFFSET);
      } else if (top < TOP_OFFSET) {
        window.scrollTo(0, top + window.pageYOffset - TOP_OFFSET);
      }
    }
  }

  render() {
    const {
      branchLike,
      canBrowse = false,
      component,
      isLeak,
      metrics,
      previous,
      rootComponent,
      selected = false
    } = this.props;

    let componentAction = null;

    if (!component.refKey || component.qualifier === 'SVW') {
      switch (component.qualifier) {
        case 'FIL':
        case 'UTS':
          componentAction = <ComponentPin branchLike={branchLike} component={component} />;
          break;
        default:
          componentAction = <ComponentLink branchLike={branchLike} component={component} />;
      }
    }

    return (
      <tr className={classNames({ selected })} ref={node => (this.node = node)}>
        <td className="blank" />
        <td className="thin nowrap">
          <span className="spacer-right">{componentAction}</span>
        </td>
        <td className="code-name-cell">
          <ComponentName
            branchLike={branchLike}
            canBrowse={canBrowse}
            component={component}
            previous={previous}
            rootComponent={rootComponent}
          />
        </td>

        {metrics.map(metric => (
          <td className={classNames('thin nowrap text-right', { leak: isLeak })} key={metric.key}>
            <div className="code-components-cell">
              <ComponentMeasure component={component} metric={metric} />
            </div>
          </td>
        ))}
        <td className={classNames('blank', { leak: isLeak })} />
      </tr>
    );
  }
}
