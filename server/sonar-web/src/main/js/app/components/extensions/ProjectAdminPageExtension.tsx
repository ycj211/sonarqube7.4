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
import { connect } from 'react-redux';
import { Location } from 'history';
import ExtensionContainer from './ExtensionContainer';
import NotFound from '../NotFound';
import { addGlobalErrorMessage } from '../../../store/globalMessages';
import { Component } from '../../types';

interface Props {
  component: Component;
  location: Location;
  params: { extensionKey: string; pluginKey: string };
}

function ProjectAdminPageExtension(props: Props) {
  const { extensionKey, pluginKey } = props.params;
  const { component } = props;
  const extension =
    component.configuration &&
    (component.configuration.extensions || []).find(p => p.key === `${pluginKey}/${extensionKey}`);
  return extension ? (
    <ExtensionContainer extension={extension} options={{ component }} />
  ) : (
    <NotFound withContainer={false} />
  );
}

const mapDispatchToProps = { onFail: addGlobalErrorMessage };

export default connect(
  null,
  mapDispatchToProps
)(ProjectAdminPageExtension);
