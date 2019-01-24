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
import { minBy } from 'lodash';
import * as PropTypes from 'prop-types';
import { AutoSizer } from 'react-virtualized/dist/commonjs/AutoSizer';
import PreviewGraphTooltips from './PreviewGraphTooltips';
import AdvancedTimeline from '../charts/AdvancedTimeline';
import {
  DEFAULT_GRAPH,
  getDisplayedHistoryMetrics,
  generateSeries,
  getSeriesMetricType,
  hasHistoryDataValue,
  PROJECT_ACTIVITY_GRAPH,
  PROJECT_ACTIVITY_GRAPH_CUSTOM,
  splitSeriesInGraphs,
  Serie
} from '../../apps/projectActivity/utils';
import { get } from '../../helpers/storage';
import { formatMeasure, getShortType } from '../../helpers/measures';
import { getBranchLikeQuery } from '../../helpers/branches';
import { BranchLike, Metric } from '../../app/types';

interface History {
  [x: string]: Array<{ date: Date; value?: string }>;
}

interface Props {
  branchLike?: BranchLike;
  history?: History;
  metrics: { [key: string]: Metric };
  project: string;
  renderWhenEmpty?: () => React.ReactNode;
}

interface State {
  customMetrics: string[];
  graph: string;
  selectedDate?: Date;
  series: Serie[];
  tooltipIdx?: number;
  tooltipXPos?: number;
}

const GRAPH_PADDING = [4, 0, 4, 0];
const MAX_GRAPH_NB = 1;
const MAX_SERIES_PER_GRAPH = 3;

export default class PreviewGraph extends React.PureComponent<Props, State> {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props: Props) {
    super(props);
    const customGraphs = get(PROJECT_ACTIVITY_GRAPH_CUSTOM);
    const graph = get(PROJECT_ACTIVITY_GRAPH) || 'issues';
    const customMetrics = customGraphs ? customGraphs.split(',') : [];
    const series = splitSeriesInGraphs(
      this.getSeries(props.history, graph, customMetrics, props.metrics),
      MAX_GRAPH_NB,
      MAX_SERIES_PER_GRAPH
    );
    this.state = {
      customMetrics,
      graph,
      series: series.length > 0 ? series[0] : []
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.history !== this.props.history || nextProps.metrics !== this.props.metrics) {
      const customGraphs = get(PROJECT_ACTIVITY_GRAPH_CUSTOM);
      const graph = get(PROJECT_ACTIVITY_GRAPH) || 'issues';
      const customMetrics = customGraphs ? customGraphs.split(',') : [];
      const series = splitSeriesInGraphs(
        this.getSeries(nextProps.history, graph, customMetrics, nextProps.metrics),
        MAX_GRAPH_NB,
        MAX_SERIES_PER_GRAPH
      );
      this.setState({
        customMetrics,
        graph,
        series: series.length > 0 ? series[0] : []
      });
    }
  }

  formatValue = (tick: number | string) => {
    return formatMeasure(tick, getShortType(getSeriesMetricType(this.state.series)));
  };

  getDisplayedMetrics = (graph: string, customMetrics: string[]) => {
    const metrics = getDisplayedHistoryMetrics(graph, customMetrics);
    if (!metrics || metrics.length <= 0) {
      return getDisplayedHistoryMetrics(DEFAULT_GRAPH, customMetrics);
    }
    return metrics;
  };

  getSeries = (
    history: History | undefined,
    graph: string,
    customMetrics: string[],
    metrics: { [x: string]: Metric }
  ) => {
    const myHistory = history;
    if (!myHistory) {
      return [];
    }
    const displayedMetrics = this.getDisplayedMetrics(graph, customMetrics);
    const firstValid = minBy(
      displayedMetrics.map(metric => myHistory[metric].find(p => p.value !== undefined)),
      'date'
    );
    const measureHistory = displayedMetrics.map(metric => ({
      metric,
      history: firstValid
        ? myHistory[metric].filter(p => p.date >= firstValid.date)
        : myHistory[metric]
    }));
    return generateSeries(measureHistory, graph, metrics, displayedMetrics);
  };

  handleClick = () => {
    this.context.router.push({
      pathname: '/project/activity',
      query: { id: this.props.project, ...getBranchLikeQuery(this.props.branchLike) }
    });
  };

  updateTooltip = (selectedDate?: Date, tooltipXPos?: number, tooltipIdx?: number) =>
    this.setState({ selectedDate, tooltipXPos, tooltipIdx });

  renderTimeline() {
    const { graph, selectedDate, series, tooltipIdx, tooltipXPos } = this.state;
    return (
      <AutoSizer disableHeight={true}>
        {({ width }) => (
          <div>
            <AdvancedTimeline
              height={80}
              hideGrid={true}
              hideXAxis={true}
              metricType={getSeriesMetricType(series)}
              padding={GRAPH_PADDING}
              series={series}
              showAreas={['coverage', 'duplications'].includes(graph)}
              updateTooltip={this.updateTooltip}
              width={width}
            />
            {selectedDate !== undefined &&
              tooltipXPos !== undefined &&
              tooltipIdx !== undefined && (
                <PreviewGraphTooltips
                  formatValue={this.formatValue}
                  graph={graph}
                  graphWidth={width}
                  selectedDate={selectedDate}
                  series={series}
                  tooltipIdx={tooltipIdx}
                  tooltipPos={tooltipXPos}
                />
              )}
          </div>
        )}
      </AutoSizer>
    );
  }

  render() {
    const { series } = this.state;
    if (!hasHistoryDataValue(series)) {
      return this.props.renderWhenEmpty ? this.props.renderWhenEmpty() : null;
    }

    return (
      <div
        className="overview-analysis-graph big-spacer-bottom spacer-top"
        onClick={this.handleClick}
        role="link"
        tabIndex={0}>
        {this.renderTimeline()}
      </div>
    );
  }
}
