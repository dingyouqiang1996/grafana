import { cx } from '@emotion/css';
import { max } from 'lodash';
import { RefCallback, useLayoutEffect, useMemo, useRef } from 'react';
import * as React from 'react';
import { MenuListProps } from 'react-select';
import { FixedSizeList as List } from 'react-window';

import { SelectableValue, toIconName } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';

import { useTheme2 } from '../../themes/ThemeContext';
import { CustomScrollbar } from '../CustomScrollbar/CustomScrollbar';
import { Icon } from '../Icon/Icon';

import { getSelectStyles } from './getSelectStyles';

interface SelectMenuProps {
  maxHeight: number;
  innerRef: RefCallback<HTMLDivElement>;
  innerProps: {};
}

export const SelectMenu = ({ children, maxHeight, innerRef, innerProps }: React.PropsWithChildren<SelectMenuProps>) => {
  const theme = useTheme2();
  const styles = getSelectStyles(theme);

  return (
    <div {...innerProps} className={styles.menu} style={{ maxHeight }} aria-label="Select options menu">
      <CustomScrollbar scrollRefCallback={innerRef} autoHide={false} autoHeightMax="inherit" hideHorizontalTrack>
        {children}
      </CustomScrollbar>
    </div>
  );
};

SelectMenu.displayName = 'SelectMenu';

const VIRTUAL_LIST_ITEM_HEIGHT = 37;
const VIRTUAL_LIST_WIDTH_ESTIMATE_MULTIPLIER = 8;
const VIRTUAL_LIST_PADDING = 8;
// Some list items have icons or checkboxes so we need some extra width
const VIRTUAL_LIST_WIDTH_EXTRA = 36;

// A virtualized version of the SelectMenu, descriptions for SelectableValue options not supported since those are of a variable height.
//
// To support the virtualized list we have to "guess" the width of the menu container based on the longest available option.
// the reason for this is because all of the options will be positioned absolute, this takes them out of the document and no space
// is created for them, thus the container can't grow to accomodate.
//
// VIRTUAL_LIST_ITEM_HEIGHT and WIDTH_ESTIMATE_MULTIPLIER are both magic numbers.
// Some characters (such as emojis and other unicode characters) may consist of multiple code points in which case the width would be inaccurate (but larger than needed).
export const VirtualizedSelectMenu = ({
  children,
  maxHeight,
  innerRef: scrollRef,
  options,
  focusedOption,
}: MenuListProps<SelectableValue>) => {
  const theme = useTheme2();
  const styles = getSelectStyles(theme);
  const listRef = useRef<List>(null);

  // we need to check for option groups (categories)
  // these are top level options with child options
  // if they exist, flatten the list of options
  const flattenedOptions = useMemo(
    () => options.flatMap((option) => (option.options ? [option, ...option.options] : [option])),
    [options]
  );

  // scroll the focused option into view when navigating with keyboard
  const focusedIndex = flattenedOptions.findIndex(
    (option: SelectableValue<unknown>) => option.value === focusedOption?.value
  );
  useLayoutEffect(() => {
    listRef.current?.scrollToItem(focusedIndex);
  }, [focusedIndex]);

  if (!Array.isArray(children)) {
    return null;
  }

  // flatten the children to account for any categories
  // these will have array children that are the individual options
  const flattenedChildren = children.flatMap((child, index) => {
    if (hasArrayChildren(child)) {
      // need to remove the children from the category else they end up in the DOM twice
      const childWithoutChildren = React.cloneElement(child, {
        children: null,
      });
      return [
        childWithoutChildren,
        ...child.props.children.slice(0, -1),
        // add a bottom divider to the last item in the category
        React.cloneElement(child.props.children.at(-1), {
          innerProps: {
            style: {
              borderBottom: `1px solid ${theme.colors.border.weak}`,
              height: VIRTUAL_LIST_ITEM_HEIGHT,
            },
          },
        }),
      ];
    }
    return [child];
  });

  const longestOption = max(flattenedOptions.map((option) => option.label?.length)) ?? 0;
  const widthEstimate =
    longestOption * VIRTUAL_LIST_WIDTH_ESTIMATE_MULTIPLIER + VIRTUAL_LIST_PADDING * 2 + VIRTUAL_LIST_WIDTH_EXTRA;
  const heightEstimate = Math.min(flattenedChildren.length * VIRTUAL_LIST_ITEM_HEIGHT, maxHeight);

  return (
    <List
      outerRef={scrollRef}
      ref={listRef}
      className={styles.menu}
      height={heightEstimate}
      width={widthEstimate}
      aria-label="Select options menu"
      itemCount={flattenedChildren.length}
      itemSize={VIRTUAL_LIST_ITEM_HEIGHT}
    >
      {({ index, style }) => <div style={{ ...style, overflow: 'hidden' }}>{flattenedChildren[index]}</div>}
    </List>
  );
};

// check if a child has array children (and is therefore a react-select group)
// we need to flatten these so the correct count and elements are passed to the virtualized list
const hasArrayChildren = (child: React.ReactNode) => {
  return React.isValidElement(child) && Array.isArray(child.props.children);
};

VirtualizedSelectMenu.displayName = 'VirtualizedSelectMenu';

interface SelectMenuOptionProps<T> {
  isDisabled: boolean;
  isFocused: boolean;
  isSelected: boolean;
  innerProps: JSX.IntrinsicElements['div'];
  innerRef: RefCallback<HTMLDivElement>;
  renderOptionLabel?: (value: SelectableValue<T>) => JSX.Element;
  data: SelectableValue<T>;
}

export const SelectMenuOptions = ({
  children,
  data,
  innerProps,
  innerRef,
  isFocused,
  isSelected,
  renderOptionLabel,
}: React.PropsWithChildren<SelectMenuOptionProps<unknown>>) => {
  const theme = useTheme2();
  const styles = getSelectStyles(theme);
  const icon = data.icon ? toIconName(data.icon) : undefined;
  // We are removing onMouseMove and onMouseOver from innerProps because they cause the whole
  // list to re-render everytime the user hovers over an option. This is a performance issue.
  // See https://github.com/JedWatson/react-select/issues/3128#issuecomment-451936743
  const { onMouseMove, onMouseOver, ...rest } = innerProps;

  return (
    <div
      ref={innerRef}
      className={cx(
        styles.option,
        isFocused && styles.optionFocused,
        isSelected && styles.optionSelected,
        data.isDisabled && styles.optionDisabled
      )}
      {...rest}
      data-testid={selectors.components.Select.option}
      title={data.title}
    >
      {icon && <Icon name={icon} className={styles.optionIcon} />}
      {data.imgUrl && <img className={styles.optionImage} src={data.imgUrl} alt={data.label || String(data.value)} />}
      <div className={styles.optionBody}>
        <span>{renderOptionLabel ? renderOptionLabel(data) : children}</span>
        {data.description && <div className={styles.optionDescription}>{data.description}</div>}
        {data.component && <data.component />}
      </div>
    </div>
  );
};

SelectMenuOptions.displayName = 'SelectMenuOptions';
