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
import { shallow } from 'enzyme';
import LeakPeriodLegend from '../LeakPeriodLegend';
import { differenceInDays } from '../../../../helpers/dates';
import { Period, PeriodMode } from '../../../../app/types';

jest.mock('../../../../helpers/dates', () => {
  const dates = require.requireActual('../../../../helpers/dates');
  dates.differenceInDays = jest.fn().mockReturnValue(10);
  return dates;
});

it('10 days', () => {
  expect(
    getWrapper({
      date: '2013-09-22T00:00:00+0200',
      index: 0,
      mode: PeriodMode.Days,
      parameter: '10'
    })
  ).toMatchSnapshot();
});

it('date', () => {
  expect(
    getWrapper({
      date: '2013-09-22T00:00:00+0200',
      index: 0,
      mode: PeriodMode.Date,
      parameter: '2013-01-01'
    })
  ).toMatchSnapshot();
});

it('version', () => {
  expect(
    getWrapper({
      date: '2013-09-22T00:00:00+0200',
      index: 0,
      mode: PeriodMode.Version,
      parameter: '0.1'
    }).find('.overview-legend')
  ).toMatchSnapshot();
});

it('previous_version', () => {
  expect(
    getWrapper({
      date: '2013-09-22T00:00:00+0200',
      index: 0,
      mode: PeriodMode.PreviousVersion
    }).find('.overview-legend')
  ).toMatchSnapshot();
});

it('previous_analysis', () => {
  expect(
    getWrapper({
      date: '2013-09-22T00:00:00+0200',
      index: 0,
      mode: PeriodMode.PreviousAnalysis
    }).find('.overview-legend')
  ).toMatchSnapshot();
});

it('should render a more precise date', () => {
  (differenceInDays as jest.Mock<any>).mockReturnValueOnce(0);
  expect(
    getWrapper({
      date: '2018-08-17T00:00:00+0200',
      index: 0,
      mode: PeriodMode.PreviousVersion
    })
  ).toMatchSnapshot();
});

function getWrapper(period: Period) {
  return shallow(<LeakPeriodLegend period={period} />, {
    context: {
      intl: { formatDate: (date: string) => 'formatted.' + date }
    }
  });
}
