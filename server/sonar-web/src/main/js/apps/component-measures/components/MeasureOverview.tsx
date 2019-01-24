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
import Breadcrumbs from './Breadcrumbs';
import LeakPeriodLegend from './LeakPeriodLegend';
import MeasureFavoriteContainer from './MeasureFavoriteContainer';
import PageActions from './PageActions';
import BubbleChart from '../drilldown/BubbleChart';
import SourceViewer from '../../../components/SourceViewer/SourceViewer';
import { getComponentLeaves } from '../../../api/components';
import { enhanceComponent, getBubbleMetrics, isFileType } from '../utils';
import { getBranchLikeQuery } from '../../../helpers/branches';
import DeferredSpinner from '../../../components/common/DeferredSpinner';
import {
  BranchLike,
  ComponentMeasure,
  ComponentMeasureEnhanced,
  CurrentUser,
  Metric,
  Paging,
  Period
} from '../../../app/types';

interface Props {
  branchLike?: BranchLike;
  className?: string;
  component: ComponentMeasure;
  currentUser: CurrentUser;
  domain: string;
  leakPeriod?: Period;
  loading: boolean;
  metrics: { [metric: string]: Metric };
  rootComponent: ComponentMeasure;
  updateLoading: (param: { [key: string]: boolean }) => void;
  updateSelected: (component: string) => void;
}

interface State {
  components: ComponentMeasureEnhanced[];
  paging?: Paging;
}

const BUBBLES_LIMIT = 500;

export default class MeasureOverview extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = { components: [] };

  componentDidMount() {
    this.mounted = true;
    this.fetchComponents(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.component !== this.props.component ||
      nextProps.metrics !== this.props.metrics ||
      nextProps.domain !== this.props.domain
    ) {
      this.fetchComponents(nextProps);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchComponents = (props: Props) => {
    const { branchLike, component, domain, metrics } = props;
    if (isFileType(component)) {
      this.setState({ components: [], paging: undefined });
      return;
    }
    const { x, y, size, colors } = getBubbleMetrics(domain, metrics);
    const metricsKey = [x.key, y.key, size.key];
    if (colors) {
      metricsKey.push(...colors.map(metric => metric.key));
    }
    const options = {
      ...getBranchLikeQuery(branchLike),
      s: 'metric',
      metricSort: size.key,
      asc: false,
      ps: BUBBLES_LIMIT
    };

    this.props.updateLoading({ bubbles: true });
    getComponentLeaves(component.key, metricsKey, options).then(
      r => {
        if (domain === this.props.domain) {
          if (this.mounted) {
            this.setState({
              components: r.components.map(component =>
                enhanceComponent(component, undefined, metrics)
              ),
              paging: r.paging
            });
          }
          this.props.updateLoading({ bubbles: false });
        }
      },
      () => this.props.updateLoading({ bubbles: false })
    );
  };

  renderContent() {
    const { branchLike, component } = this.props;
    if (isFileType(component)) {
      return (
        <div className="measure-details-viewer">
          <SourceViewer branchLike={branchLike} component={component.key} />
        </div>
      );
    }

    return (
      <BubbleChart
        component={this.props.component}
        components={this.state.components}
        domain={this.props.domain}
        metrics={this.props.metrics}
        updateSelected={this.props.updateSelected}
      />
    );
  }

  render() {
    const { branchLike, component, currentUser, leakPeriod, rootComponent } = this.props;
    const isLoggedIn = currentUser && currentUser.isLoggedIn;
    const isFile = isFileType(component);
    return (
      <div className={this.props.className}>
        <div className="layout-page-header-panel layout-page-main-header">
          <div className="layout-page-header-panel-inner layout-page-main-header-inner">
            <div className="layout-page-main-inner">
              <Breadcrumbs
                backToFirst={true}
                branchLike={branchLike}
                className="measure-breadcrumbs spacer-right text-ellipsis"
                component={component}
                handleSelect={this.props.updateSelected}
                rootComponent={rootComponent}
              />
              {component.key !== rootComponent.key &&
                isLoggedIn && (
                  <MeasureFavoriteContainer
                    className="measure-favorite spacer-right"
                    component={component.key}
                  />
                )}
              <PageActions
                current={this.state.components.length}
                isFile={isFile}
                paging={this.state.paging}
              />
            </div>
          </div>
        </div>
        <div className="layout-page-main-inner measure-details-content">
          <div className="clearfix big-spacer-bottom">
            {leakPeriod && (
              <LeakPeriodLegend className="pull-right" component={component} period={leakPeriod} />
            )}
          </div>
          <DeferredSpinner loading={this.props.loading} />
          {!this.props.loading && this.renderContent()}
        </div>
      </div>
    );
  }
}
