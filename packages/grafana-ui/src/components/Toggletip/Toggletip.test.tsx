﻿import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Button } from '../Button';

import { Toggletip } from './Toggletip';

describe('Toggletip', () => {
  it('should display toggletip after click on "Click me!" button', async () => {
    const onOpen = jest.fn();
    render(
      <Toggletip placement="auto" content="Tooltip text" onOpen={onOpen}>
        <Button type="button" data-testid="myButton">
          Click me!
        </Button>
      </Toggletip>
    );
    expect(screen.getByText('Click me!')).toBeInTheDocument();
    const button = screen.getByTestId('myButton');
    await userEvent.click(button);

    expect(screen.getByTestId('toggletip-content')).toBeInTheDocument();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('should display toggletip if configured as `show=true`', async () => {
    render(
      <Toggletip placement="auto" content="Tooltip text" show={true}>
        <Button type="button" data-testid="myButton">
          Click me!
        </Button>
      </Toggletip>
    );

    expect(await screen.findByTestId('toggletip-content')).toBeInTheDocument();
  });

  it('should not close if configured as `show=true`', async () => {
    const onClose = jest.fn();
    render(
      <Toggletip placement="auto" content="Tooltip text" show={true} onClose={onClose}>
        <Button type="button" data-testid="myButton">
          Click me!
        </Button>
      </Toggletip>
    );

    expect(await screen.findByTestId('toggletip-content')).toBeInTheDocument();

    // Escape should not close the toggletip
    const button = screen.getByTestId('myButton');
    await userEvent.click(button);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Close button should not close the toggletip
    const closeButton = screen.getByTestId('toggletip-header-close');
    expect(closeButton).toBeInTheDocument();
    await userEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(2);

    // Either way, the toggletip should still be visible
    expect(await screen.findByTestId('toggletip-content')).toBeInTheDocument();
  });

  it('should not open if configured as `show=false`', async () => {
    const onOpen = jest.fn();
    render(
      <Toggletip placement="auto" content="Tooltip text" show={false} onOpen={onOpen}>
        <Button type="button" data-testid="myButton">
          Click me!
        </Button>
      </Toggletip>
    );

    const button = screen.getByTestId('myButton');
    await userEvent.click(button);

    expect(await screen.queryByTestId('toggletip-content')).not.toBeInTheDocument();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('should close toggletip after click on close button', async () => {
    const onClose = jest.fn();
    render(
      <Toggletip placement="auto" content="Tooltip text" onClose={onClose}>
        <Button type="button" data-testid="myButton">
          Click me!
        </Button>
      </Toggletip>
    );
    const button = screen.getByTestId('myButton');
    await userEvent.click(button);

    expect(screen.getByTestId('toggletip-content')).toBeInTheDocument();

    const closeButton = screen.getByTestId('toggletip-header-close');
    expect(closeButton).toBeInTheDocument();
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close toggletip after press ESC', async () => {
    const onClose = jest.fn();
    render(
      <Toggletip placement="auto" content="Tooltip text" onClose={onClose}>
        <Button type="button" data-testid="myButton">
          Click me!
        </Button>
      </Toggletip>
    );
    const button = screen.getByTestId('myButton');
    await userEvent.click(button);

    expect(screen.getByTestId('toggletip-content')).toBeInTheDocument();

    await userEvent.keyboard('{escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should display the toggletip after press ENTER', async () => {
    const onOpen = jest.fn();
    render(
      <Toggletip placement="auto" content="Tooltip text" onOpen={onOpen}>
        <Button type="button" data-testid="myButton">
          Click me!
        </Button>
      </Toggletip>
    );

    expect(screen.queryByTestId('toggletip-content')).not.toBeInTheDocument();

    // open toggletip with enter
    const button = screen.getByTestId('myButton');
    button.focus();
    await userEvent.keyboard('{enter}');

    expect(screen.getByTestId('toggletip-content')).toBeInTheDocument();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('should be able to focus toggletip content next in DOM order - forwards and backwards', async () => {
    const onClose = jest.fn();
    const afterInDom = 'Outside of toggletip';

    render(
      <>
        <Toggletip placement="auto" content="Tooltip text" onClose={onClose}>
          <Button type="button" data-testid="myButton">
            Click me!
          </Button>
        </Toggletip>
        <button>{afterInDom}</button>
      </>
    );

    expect(screen.queryByTestId('toggletip-content')).not.toBeInTheDocument();

    const button = screen.getByTestId('myButton');
    const afterButton = screen.getByText(afterInDom);
    await userEvent.click(button);

    const closeButton = screen.getByTestId('toggletip-header-close');
    expect(closeButton).toHaveFocus();

    // focus after
    await userEvent.tab();
    expect(afterButton).toHaveFocus();

    // focus backwards
    await userEvent.tab({ shift: true });
    expect(closeButton).toHaveFocus();

    // focus back to togglebutton
    await userEvent.tab({ shift: true });
    expect(button).toHaveFocus();
  });

  describe('Focus state', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      jest.useFakeTimers();
      // Need to use delay: null here to work with fakeTimers
      // see https://github.com/testing-library/user-event/issues/833
      user = userEvent.setup({ delay: null });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should restore focus to the button that opened the toggletip when closed from within the toggletip', async () => {
      const onClose = jest.fn();
      render(
        <Toggletip placement="auto" content="Tooltip text" onClose={onClose}>
          <Button type="button" data-testid="myButton">
            Click me!
          </Button>
        </Toggletip>
      );

      const button = screen.getByTestId('myButton');
      await user.click(button);
      const closeButton = await screen.findByTestId('toggletip-header-close');
      expect(closeButton).toBeInTheDocument();
      await user.click(closeButton);
      act(() => {
        jest.runAllTimers();
      });

      expect(button).toHaveFocus();
    });

    it('should NOT restore focus to the button that opened the toggletip when closed from outside the toggletip', async () => {
      const onClose = jest.fn();
      const afterInDom = 'Outside of toggletip';

      render(
        <>
          <Toggletip placement="auto" content="Tooltip text" onClose={onClose}>
            <Button type="button" data-testid="myButton">
              Click me!
            </Button>
          </Toggletip>
          <button>{afterInDom}</button>
        </>
      );

      const button = screen.getByTestId('myButton');
      await user.click(button);
      const closeButton = await screen.findByTestId('toggletip-header-close');

      expect(closeButton).toBeInTheDocument();
      const afterButton = screen.getByText(afterInDom);
      afterButton.focus();

      await user.keyboard('{escape}');
      act(() => {
        jest.runAllTimers();
      });

      expect(afterButton).toHaveFocus();
    });
  });
});
