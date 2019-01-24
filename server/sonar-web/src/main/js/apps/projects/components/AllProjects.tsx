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
import Helmet from 'react-helmet';
import { omitBy } from 'lodash';
import PageHeader from './PageHeader';
import ProjectsList from './ProjectsList';
import PageSidebar from './PageSidebar';
import Suggestions from '../../../app/components/embed-docs-modal/Suggestions';
import Visualizations from '../visualizations/Visualizations';
import { CurrentUser, Organization } from '../../../app/types';
import handleRequiredAuthentication from '../../../app/utils/handleRequiredAuthentication';
import DeferredSpinner from '../../../components/common/DeferredSpinner';
import ListFooter from '../../../components/controls/ListFooter';
import ScreenPositionHelper from '../../../components/common/ScreenPositionHelper';
import { translate } from '../../../helpers/l10n';
import { get, save } from '../../../helpers/storage';
import { RawQuery } from '../../../helpers/query';
import { Project, Facets } from '../types';
import { fetchProjects, parseSorting, SORTING_SWITCH } from '../utils';
import { parseUrlQuery, Query, hasFilterParams, hasVisualizationParams } from '../query';
import { isSonarCloud } from '../../../helpers/system';
import { isLoggedIn } from '../../../helpers/users';
import '../../../components/search-navigator.css';
import '../styles.css';

export interface Props {
  currentUser: CurrentUser;
  isFavorite: boolean;
  location: { pathname: string; query: RawQuery };
  organization: Organization | undefined;
  organizationsEnabled?: boolean;
  storageOptionsSuffix?: string;
}

interface State {
  facets?: Facets;
  loading: boolean;
  pageIndex?: number;
  projects?: Project[];
  query: Query;
  total?: number;
}

const PROJECTS_SORT = 'sonarqube.projects.sort';
const PROJECTS_VIEW = 'sonarqube.projects.view';
const PROJECTS_VISUALIZATION = 'sonarqube.projects.visualization';

export default class AllProjects extends React.PureComponent<Props, State> {
  mounted = false;

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props: Props) {
    super(props);
    this.state = { loading: true, query: {} };
  }

  componentDidMount() {
    this.mounted = true;

    if (this.props.isFavorite && !isLoggedIn(this.props.currentUser)) {
      handleRequiredAuthentication();
      return;
    }
    this.handleQueryChange(true);
    const footer = document.getElementById('footer');
    if (footer) {
      footer.classList.add('page-footer-with-sidebar');
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.location.query !== this.props.location.query) {
      this.handleQueryChange(false);
    }
  }

  componentWillUnmount() {
    this.mounted = false;

    const footer = document.getElementById('footer');
    if (footer) {
      footer.classList.remove('page-footer-with-sidebar');
    }
  }

  getView = () => this.state.query.view || 'overall';

  getVisualization = () => this.state.query.visualization || 'risk';

  getSort = () => this.state.query.sort || 'name';

  stopLoading = () => {
    if (this.mounted) {
      this.setState({ loading: false });
    }
  };

  fetchProjects = (query: any) => {
    this.setState({ loading: true, query });
    fetchProjects(query, this.props.isFavorite, this.props.organization).then(response => {
      if (this.mounted) {
        this.setState({
          facets: response.facets,
          loading: false,
          pageIndex: 1,
          projects: response.projects,
          total: response.total
        });
      }
    }, this.stopLoading);
  };

  fetchMoreProjects = () => {
    const { pageIndex, projects, query } = this.state;
    if (pageIndex && projects && query) {
      this.setState({ loading: true });
      fetchProjects(query, this.props.isFavorite, this.props.organization, pageIndex + 1).then(
        response => {
          if (this.mounted) {
            this.setState({
              loading: false,
              pageIndex: pageIndex + 1,
              projects: [...projects, ...response.projects]
            });
          }
        },
        this.stopLoading
      );
    }
  };

  getStorageOptions = () => {
    const { storageOptionsSuffix } = this.props;
    const options: {
      sort?: string;
      view?: string;
      visualization?: string;
    } = {};
    if (get(PROJECTS_SORT, storageOptionsSuffix)) {
      options.sort = get(PROJECTS_SORT, storageOptionsSuffix) || undefined;
    }
    if (get(PROJECTS_VIEW, storageOptionsSuffix)) {
      options.view = get(PROJECTS_VIEW, storageOptionsSuffix) || undefined;
    }
    if (get(PROJECTS_VISUALIZATION, storageOptionsSuffix)) {
      options.visualization = get(PROJECTS_VISUALIZATION, storageOptionsSuffix) || undefined;
    }
    return options;
  };

  handlePerspectiveChange = ({ view, visualization }: { view: string; visualization?: string }) => {
    const { storageOptionsSuffix } = this.props;
    const query: {
      view: string | undefined;
      visualization: string | undefined;
      sort?: string | undefined;
    } = {
      view: view === 'overall' ? undefined : view,
      visualization
    };

    if (this.state.query.view === 'leak' || view === 'leak') {
      if (this.state.query.sort) {
        const sort = parseSorting(this.state.query.sort);
        if (SORTING_SWITCH[sort.sortValue]) {
          query.sort = (sort.sortDesc ? '-' : '') + SORTING_SWITCH[sort.sortValue];
        }
      }
      this.context.router.push({ pathname: this.props.location.pathname, query });
    } else {
      this.updateLocationQuery(query);
    }

    save(PROJECTS_SORT, query.sort, storageOptionsSuffix);
    save(PROJECTS_VIEW, query.view, storageOptionsSuffix);
    save(PROJECTS_VISUALIZATION, visualization, storageOptionsSuffix);
  };

  handleSortChange = (sort: string, desc: boolean) => {
    const asString = (desc ? '-' : '') + sort;
    this.updateLocationQuery({ sort: asString });
    save(PROJECTS_SORT, asString, this.props.storageOptionsSuffix);
  };

  handleQueryChange(initialMount: boolean) {
    const query = parseUrlQuery(this.props.location.query);
    const savedOptions = this.getStorageOptions();
    const savedOptionsSet = savedOptions.sort || savedOptions.view || savedOptions.visualization;

    // if there is no visualization parameters (sort, view, visualization), but there are saved preferences in the localStorage
    if (initialMount && !hasVisualizationParams(query) && savedOptionsSet) {
      this.context.router.replace({ pathname: this.props.location.pathname, query: savedOptions });
    } else {
      this.fetchProjects(query);
    }
  }

  updateLocationQuery = (newQuery: RawQuery) => {
    const query = omitBy({ ...this.props.location.query, ...newQuery }, x => !x);
    this.context.router.push({ pathname: this.props.location.pathname, query });
  };

  handleClearAll = () => {
    this.context.router.push({ pathname: this.props.location.pathname });
  };

  renderSide = () => (
    <ScreenPositionHelper className="layout-page-side-outer">
      {({ top }) => (
        <div className="layout-page-side projects-page-side" style={{ top }}>
          <div className="layout-page-side-inner">
            <div className="layout-page-filters">
              <PageSidebar
                facets={this.state.facets}
                onClearAll={this.handleClearAll}
                onQueryChange={this.updateLocationQuery}
                organization={this.props.organization}
                query={this.state.query}
                showFavoriteFilter={!isSonarCloud()}
                view={this.getView()}
                visualization={this.getVisualization()}
              />
            </div>
          </div>
        </div>
      )}
    </ScreenPositionHelper>
  );

  renderHeader = () => (
    <div className="layout-page-header-panel layout-page-main-header">
      <div className="layout-page-header-panel-inner layout-page-main-header-inner">
        <div className="layout-page-main-inner">
          <PageHeader
            currentUser={this.props.currentUser}
            isFavorite={this.props.isFavorite}
            loading={this.state.loading}
            onPerspectiveChange={this.handlePerspectiveChange}
            onQueryChange={this.updateLocationQuery}
            onSortChange={this.handleSortChange}
            organization={this.props.organization}
            projects={this.state.projects}
            query={this.state.query}
            selectedSort={this.getSort()}
            total={this.state.total}
            view={this.getView()}
            visualization={this.getVisualization()}
          />
        </div>
      </div>
    </div>
  );

  renderMain = () => {
    return (
      <DeferredSpinner loading={this.state.loading}>
        {this.getView() === 'visualizations' ? (
          <div className="layout-page-main-inner">
            {this.state.projects && (
              <Visualizations
                displayOrganizations={!this.props.organization && this.props.organizationsEnabled}
                projects={this.state.projects}
                sort={this.state.query.sort}
                total={this.state.total}
                visualization={this.getVisualization()}
              />
            )}
          </div>
        ) : (
          <div className="layout-page-main-inner">
            {this.state.projects && (
              <ProjectsList
                cardType={this.getView()}
                currentUser={this.props.currentUser}
                isFavorite={this.props.isFavorite}
                isFiltered={hasFilterParams(this.state.query)}
                organization={this.props.organization}
                projects={this.state.projects}
                query={this.state.query}
              />
            )}
            <ListFooter
              count={this.state.projects !== undefined ? this.state.projects.length : 0}
              loadMore={this.fetchMoreProjects}
              ready={!this.state.loading}
              total={this.state.total !== undefined ? this.state.total : 0}
            />
          </div>
        )}
      </DeferredSpinner>
    );
  };

  render() {
    return (
      <div className="layout-page projects-page" id="projects-page">
        <Suggestions suggestions="projects" />
        <Helmet title={translate('projects.page')} />

        {this.renderSide()}

        <div className="layout-page-main">
          {this.renderHeader()}
          {this.renderMain()}
        </div>
      </div>
    );
  }
}
