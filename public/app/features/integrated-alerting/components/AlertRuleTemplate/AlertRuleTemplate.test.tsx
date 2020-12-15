import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { dataQa } from '@percona/platform-core';
import { act } from 'react-dom/test-utils';
import { AlertRuleTemplate } from './AlertRuleTemplate';
import { AlertRuleTemplateService } from './AlertRuleTemplate.service';

jest.mock('./AlertRuleTemplate.service');

describe('AlertRuleTemplate', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render add modal', async () => {
    let wrapper: ReactWrapper;

    await act(async () => {
      wrapper = mount(<AlertRuleTemplate />);
    });

    expect(wrapper.find('textarea')).toBeTruthy();
    expect(wrapper.contains(dataQa('modal-wrapper'))).toBeFalsy();

    wrapper.find(dataQa('alert-rule-template-add-modal-button')).find('button').simulate('click');

    expect(wrapper.find(dataQa('modal-wrapper'))).toBeTruthy();
  });

  it('should render table content', async () => {
    let wrapper: ReactWrapper;

    await act(async () => {
      wrapper = mount(<AlertRuleTemplate />);
    });

    wrapper.update();

    expect(wrapper.find(dataQa('alert-rule-templates-table-thead')).find('tr')).toHaveLength(1);
    expect(wrapper.find(dataQa('alert-rule-templates-table-tbody')).find('tr')).toHaveLength(3);
    expect(wrapper.find(dataQa('alert-rule-templates-table-no-data'))).toHaveLength(0);
  });

  it('should render correctly without data', async () => {
    jest.spyOn(AlertRuleTemplateService, 'list').mockImplementation(() => {
      throw Error('test error');
    });

    let wrapper: ReactWrapper;

    await act(async () => {
      wrapper = mount(<AlertRuleTemplate />);
    });

    wrapper.update();

    expect(wrapper.find(dataQa('alert-rule-templates-table-no-data'))).toHaveLength(1);
  });
});
