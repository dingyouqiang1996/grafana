import { Field, Label } from '@grafana/ui';
import React, { ComponentType, ReactNode } from 'react';
import { OptionsPaneCategoryDescriptor } from './OptionsPaneCategoryDescriptor';

export interface OptionsPaneItemProps {
  title: string;
  value?: any;
  description?: string;
  Component: ComponentType;
  skipField?: boolean;
  showIf?: () => boolean;
}

/**
 * This is not a real React component but an intermediary to enable deep option search without traversing a React node tree.
 */
export class OptionsPaneItemDescriptor {
  parent!: OptionsPaneCategoryDescriptor;

  constructor(public props: OptionsPaneItemProps) {}

  getLabel(isSearching?: boolean): ReactNode {
    const { title, description } = this.props;

    if (!isSearching) {
      // Do not render label for categories with only one child
      if (this.parent.props.title === title) {
        return null;
      }

      return title;
    }

    const categories: string[] = [];

    if (this.parent.parent) {
      categories.push(this.parent.parent.props.title);
    }

    if (this.parent.props.title !== title) {
      categories.push(this.parent.props.title);
    }

    return (
      <Label description={description} category={categories}>
        {title}
      </Label>
    );
  }

  render(isSearching?: boolean) {
    const { title, description, Component, showIf, skipField } = this.props;
    const key = `${this.parent.props.id}${title}`;

    if (showIf && !showIf()) {
      return null;
    }

    if (skipField) {
      return <Component key={key} />;
    }

    return (
      <Field label={this.getLabel(isSearching)} description={description} key={key}>
        <Component />
      </Field>
    );
  }
}
