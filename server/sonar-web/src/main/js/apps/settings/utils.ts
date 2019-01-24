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
import { translate, hasMessage } from '../../helpers/l10n';
import {
  Omit,
  Setting,
  SettingCategoryDefinition,
  SettingType,
  SettingDefinition
} from '../../app/types';

export const DEFAULT_CATEGORY = 'general';

export type DefaultSpecializedInputProps = Omit<DefaultInputProps, 'setting'> & {
  isDefault: boolean;
  name: string;
};

export interface DefaultInputProps {
  hasValueChanged?: boolean;
  onCancel?: () => void;
  onChange: (value: any) => void;
  onSave?: () => void;
  setting: Setting;
  value: any;
}

export function getPropertyName(definition: SettingDefinition) {
  const key = `property.${definition.key}.name`;
  return hasMessage(key) ? translate(key) : definition.name;
}

export function getPropertyDescription(definition: SettingDefinition) {
  const key = `property.${definition.key}.description`;
  return hasMessage(key) ? translate(key) : definition.description;
}

export function getCategoryName(category: string) {
  const key = `property.category.${category}`;
  return hasMessage(key) ? translate(key) : category;
}

export function getSubCategoryName(category: string, subCategory: string) {
  const key = `property.category.${category}.${subCategory}`;
  return hasMessage(key) ? translate(key) : getCategoryName(subCategory);
}

export function getSubCategoryDescription(category: string, subCategory: string) {
  const key = `property.category.${category}.${subCategory}.description`;
  return hasMessage(key) ? translate(key) : null;
}

export function getUniqueName(definition: SettingDefinition, index?: string) {
  const indexSuffix = index ? `[${index}]` : '';
  return `settings[${definition.key}]${indexSuffix}`;
}

export function getSettingValue({ definition, fieldValues, value, values }: Setting) {
  if (isCategoryDefinition(definition) && definition.multiValues) {
    return values;
  } else if (definition.type === SettingType.PropertySet) {
    return fieldValues;
  } else {
    return value;
  }
}

export function isEmptyValue(definition: SettingDefinition, value: any) {
  if (value == null) {
    return true;
  } else if (definition.type === SettingType.Boolean) {
    return false;
  } else {
    return value.length === 0;
  }
}

export function isCategoryDefinition(item: SettingDefinition): item is SettingCategoryDefinition {
  return Boolean((item as any).fields);
}

export function getEmptyValue(item: SettingDefinition | SettingCategoryDefinition): any {
  if (isCategoryDefinition(item)) {
    if (item.multiValues) {
      return [getEmptyValue({ ...item, multiValues: false })];
    }

    if (item.type === SettingType.PropertySet) {
      const value: { [key: string]: string } = {};
      item.fields.forEach(field => (value[field.key] = getEmptyValue(field)));
      return [value];
    }
  }

  if (item.type === SettingType.Boolean || item.type === SettingType.SingleSelectList) {
    return null;
  }
  return '';
}

export function isDefaultOrInherited(setting: Setting) {
  return Boolean(setting.inherited);
}

export function getDefaultValue(setting: Setting) {
  const { definition, parentFieldValues, parentValue, parentValues } = setting;

  if (definition.type === SettingType.Password) {
    return translate('settings.default.password');
  }

  if (definition.type === SettingType.Boolean && parentValue) {
    const isTrue = parentValue === 'true';
    return isTrue ? translate('settings.boolean.true') : translate('settings.boolean.false');
  }

  if (
    isCategoryDefinition(definition) &&
    definition.multiValues &&
    parentValues &&
    parentValues.length > 0
  ) {
    return parentValues.join(', ');
  }

  if (
    definition.type === SettingType.PropertySet &&
    parentFieldValues &&
    parentFieldValues.length > 0
  ) {
    return translate('settings.default.complex_value');
  }

  if (parentValue == null) {
    return isCategoryDefinition(definition) && definition.defaultValue
      ? definition.defaultValue
      : translate('settings.default.no_value');
  }

  return parentValue;
}
