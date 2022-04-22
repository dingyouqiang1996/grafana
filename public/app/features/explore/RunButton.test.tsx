import { shallow } from 'enzyme';
import React from 'react';

import { RefreshPicker } from '@grafana/ui';
import { getTimeSrv, TimeSrv } from 'app/features/dashboard/services/TimeSrv';

import { RunButton, Props } from './RunButton';

const setup = (propOverrides?: object) => {
  const props: Props = {
    isSmall: false,
    loading: false,
    isLive: false,
    onRun: jest.fn(),
    refreshInterval: '5m',
    onChangeRefreshInterval: jest.fn(),
    showDropdown: false,
  };

  Object.assign(props, propOverrides);

  const wrapper = shallow(<RunButton {...props} />);
  return wrapper;
};

const validIntervals = ['1d'];
jest.mock('app/features/dashboard/services/TimeSrv', () => ({
  getTimeSrv: jest.fn().mockReturnValue({
    getValidIntervals(intervals: string[]): string[] {
      return validIntervals;
    },
  }),
}));
const getTimeSrvMock = getTimeSrv as any as jest.Mock<TimeSrv>;

beforeEach(() => {
  getTimeSrvMock.mockClear();
});

describe('RunButton', () => {
  describe('if showdropdown is set', () => {
    it('should render a RefreshPicker with only valid intervals', () => {
      const wrapper = setup({ showDropdown: true });

      expect(wrapper.find(RefreshPicker)).toHaveLength(1);
      expect(wrapper.find(RefreshPicker).props().intervals).toEqual(validIntervals);
    });
  });
});
