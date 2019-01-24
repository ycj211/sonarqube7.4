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
package org.sonar.ce.task.taskprocessor;

import org.assertj.core.api.Assertions;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.sonar.ce.task.CeTaskResult;

import static org.mockito.Mockito.mock;

public class MutableTaskResultHolderImplTest {
  @Rule
  public ExpectedException expectedException = ExpectedException.none();

  private MutableTaskResultHolder underTest = new MutableTaskResultHolderImpl();

  @Test
  public void getResult_throws_ISE_if_no_CeTaskResult_is_set() {
    expectedException.expect(IllegalStateException.class);
    expectedException.expectMessage("No CeTaskResult has been set in the holder");

    underTest.getResult();
  }

  @Test
  public void getResult_returns_object_set_with_setResult() {
    CeTaskResult taskResult = mock(CeTaskResult.class);

    underTest.setResult(taskResult);

    Assertions.assertThat(underTest.getResult()).isSameAs(taskResult);
  }

  @Test
  public void setResult_throws_NPE_if_CeTaskResult_argument_is_null() {
    expectedException.expect(NullPointerException.class);
    expectedException.expectMessage("taskResult can not be null");

    underTest.setResult(null);
  }

  @Test
  public void setResult_throws_ISE_if_called_twice() {
    underTest.setResult(mock(CeTaskResult.class));

    expectedException.expect(IllegalStateException.class);
    expectedException.expectMessage("CeTaskResult has already been set in the holder");

    underTest.setResult(mock(CeTaskResult.class));
  }
}
