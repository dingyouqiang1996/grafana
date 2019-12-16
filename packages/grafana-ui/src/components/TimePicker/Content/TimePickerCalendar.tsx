import React, { memo } from 'react';
import { css, cx } from 'emotion';
import Calendar from 'react-calendar/dist/entry.nostyle';
import { GrafanaTheme, dateTime, TIME_FORMAT } from '@grafana/data';
import { stringToDateTimeType } from '../time';
import { useTheme, stylesFactory } from '../../../themes';
import TimePickerTitle from './TimePickerTitle';
import Forms from '../../Forms';
import { Portal } from '../../Portal/Portal';

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    container: css`
      top: 0;
      position: absolute;
      right: 546px;
      box-shadow: 0px 4px 4px #c7d0d9;

      &:after {
        display: block;
        background-color: ${theme.background.dropdown};
        width: 4px;
        height: 221px;
        content: ' ';
        position: absolute;
        top: 0;
        right: -3px;
        border-left: 1px solid ${theme.colors.gray4};
      }
    `,
    modal: css`
      position: fixed;
      top: 20%;
      width: 100%;
      z-index: ${theme.zIndex.modal};
    `,
    content: css`
      margin: 0 auto;
      width: 268px;
    `,
    backdrop: css`
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: #202226;
      opacity: 0.7;
      z-index: ${theme.zIndex.modalBackdrop};
      text-align: center;
    `,
  };
});

const getFooterStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    container: css`
      background-color: ${theme.background.dropdown};
      display: flex;
      justify-content: center;
      padding: 10px;
      align-items: stretch;
    `,
    apply: css`
      margin-right: 4px;
      width: 100%;
      justify-content: center;
    `,
  };
});

const getBodyStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    title: css`
      color: ${theme.colors.text}
      background-color: inherit;
      line-height: 21px;
      font-size: ${theme.typography.size.md};
      border: 1px solid transparent;

      &:hover {
        box-shadow: $panel-editor-viz-item-shadow-hover;
        background: $panel-editor-viz-item-bg-hover;
        border: $panel-editor-viz-item-border-hover;
        color: $text-color-strong;
        position: relative;
      }
    `,
    body: css`
      background-color: white;
      width: 268px;

      .react-calendar__navigation__label,
      .react-calendar__navigation__arrow,
      .react-calendar__navigation {
        color: ${theme.colors.text};
        border: 0;
        font-weight: ${theme.typography.weight.semibold};
      }

      .react-calendar__month-view__weekdays {
        background-color: inherit;
        text-align: center;
        color: ${theme.colors.blueShade};

        abbr {
          border: 0;
          text-decoration: none;
          cursor: default;
          color: $orange;
          font-weight: $font-weight-semi-bold;
          display: block;
          padding: 4px 0 0 0;
        }
      }

      .react-calendar__month-view__days {
        background-color: inherit;
      }

      .react-calendar__tile--now {
        background-color: inherit;
      }

      .react-calendar__navigation__label,
      .react-calendar__navigation > button:focus,
      .time-picker-calendar-tile:focus {
        outline: 0;
      }

      .react-calendar__tile--now {
        border-radius: $border-radius;
      }

      .react-calendar__tile--active,
      .react-calendar__tile--active:hover {
        color: ${theme.colors.white};
        font-weight: ${theme.typography.weight.semibold};
        background: #5794f2;
        box-shadow: none;
        border: 0px;
      }

      .react-calendar__tile--rangeEnd,
      .react-calendar__tile--rangeStart {
        padding: 0;
        border: 0px;
        color: ${theme.colors.white};
        font-weight: ${theme.typography.weight.semibold};
        background: #5794f2;

        abbr {
          background-color: #1f60c4;
          border-radius: 100px;
          display: block;
          padding: 2px 7px 3px;
        }
      }

      .react-calendar__tile--rangeStart {
        border-top-left-radius: 20px;
        border-bottom-left-radius: 20px;
      }

      .react-calendar__tile--rangeEnd {
        border-top-right-radius: 20px;
        border-bottom-right-radius: 20px;
      }
    `,
  };
});

const getHeaderStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    container: css`
      background-color: ${theme.background.dropdown};
      display: flex;
      justify-content: space-between;
      padding: 7px;
    `,
    close: css`
      cursor: pointer;
      font-size: ${theme.typography.size.lg};
    `,
  };
});

interface Props {
  isOpen: boolean;
  from: string;
  to: string;
  onClose: () => void;
  onApply: () => void;
  onChange: (from: string, to: string) => void;
  isFullscreen: boolean;
}

const TimePickerCalendar: React.FC<Props> = props => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { isOpen, isFullscreen } = props;

  if (!isOpen) {
    return null;
  }

  if (isFullscreen) {
    return (
      <div className={styles.container}>
        <Body {...props} />
      </div>
    );
  }

  return (
    <Portal>
      <div className={styles.modal} onClick={event => event.stopPropagation()}>
        <div className={styles.content}>
          <Header {...props} />
          <Body {...props} />
          <Footer {...props} />
        </div>
      </div>
      <div className={styles.backdrop} onClick={event => event.stopPropagation()} />
    </Portal>
  );
};

const Header = memo<Props>(({ onClose }) => {
  const theme = useTheme();
  const styles = getHeaderStyles(theme);

  return (
    <div className={styles.container}>
      <TimePickerTitle>Select a time range</TimePickerTitle>
      <i className={cx(styles.close, 'fa', 'fa-times')} onClick={onClose} />
    </div>
  );
});

const Body = memo<Props>(props => {
  const theme = useTheme();
  const styles = getBodyStyles(theme);
  const { from, to, onChange } = props;

  return (
    <Calendar
      selectRange={true}
      next2Label={null}
      prev2Label={null}
      className={styles.body}
      tileClassName={styles.title}
      value={inputToValue(from, to)}
      nextLabel={<span className="fa fa-angle-right" />}
      prevLabel={<span className="fa fa-angle-left" />}
      onChange={value => valueToInput(value, onChange)}
    />
  );
});

const Footer = memo<Props>(({ onClose, onApply }) => {
  const theme = useTheme();
  const styles = getFooterStyles(theme);

  return (
    <div className={styles.container}>
      <Forms.Button className={styles.apply} onClick={onApply}>
        Apply time range
      </Forms.Button>
      <Forms.Button variant="secondary" onClick={onClose}>
        Cancel
      </Forms.Button>
    </div>
  );
});

function inputToValue(from: string, to: string): Date[] | Date {
  const fromAsDateTime = stringToDateTimeType(from);
  const toAsDateTime = stringToDateTimeType(to);
  const fromAsDate = fromAsDateTime.isValid() ? fromAsDateTime.toDate() : new Date();
  const toAsDate = toAsDateTime.isValid() ? toAsDateTime.toDate() : new Date();

  if (fromAsDate > toAsDate) {
    return [toAsDate, fromAsDate];
  }
  return [fromAsDate, toAsDate];
}

function valueToInput(value: Date | Date[], onChange: (from: string, to: string) => void): void {
  const [from, to] = value;
  const fromAsString = dateTime(from).format(TIME_FORMAT);
  const toAsString = dateTime(to).format(TIME_FORMAT);

  return onChange(fromAsString, toAsString);
}

export default memo(TimePickerCalendar);
