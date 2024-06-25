import { useStyles2 } from '@grafana/ui';

import { getServerStyles, ServerData } from '../server';

export const ServerStack = (data: ServerData) => {
  const styles = useStyles2(getServerStyles(data));
  return (
    <g className={styles.outline} transform="translate(.5 .49865)">
      <g className={styles.server}>
        <path d="m3.4834 21.768 8.0783-19.456h50.875l8.0784 19.456" />
        <path d="m2.3125 24.852c0-2.5592 2.0658-4.625 4.625-4.625h60.125c2.5592 0 4.625 2.0658 4.625 4.625v7.8933c0 2.5592-2.0658 4.625-4.625 4.625h-60.125c-2.5592 0-4.625-2.0658-4.625-4.625z" />
        <path d="m2.3125 42.031c0-2.5592 2.0658-4.6251 4.625-4.6251h60.125c2.5592 0 4.625 2.0659 4.625 4.6251v7.8933c0 2.5592-2.0658 4.625-4.625 4.625h-60.125c-2.5592 0-4.625-2.0658-4.625-4.625z" />
        <path d="m2.3125 59.172c0-2.5592 2.0658-4.625 4.625-4.625h60.125c2.5592 0 4.625 2.0658 4.625 4.625v7.8933c0 2.5592-2.0658 4.625-4.625 4.625h-60.125c-2.5592 0-4.625-2.0658-4.625-4.625z" />
      </g>
      <path d="m11.562 28.797h31.111" />
      <path d="m52.508 20.227v17.143" />
      <path d="m11.562 63.117h31.111" />
      <path d="m52.508 54.547v17.143" />
      <path d="m11.562 45.977h31.111" />
      <path d="m52.508 37.406v17.143" />
      <g className={styles.circleBack}>
        <path
          transform="matrix(2.7868 0 0 2.7868 -111.31 -143.2)"
          d="m62.198 60.586c.6388 0 1.1558.5171 1.1558 1.1559 0 .6387-.517 1.1558-1.1558 1.1558-.6387 0-1.1558-.5171-1.1558-1.1558 0-.6388.5171-1.1559 1.1558-1.1559z"
        />
        <path
          transform="matrix(2.7868 0 0 2.7868 -111.31 -126.14)"
          d="m62.198 60.586c.6388 0 1.1558.5171 1.1558 1.1559 0 .6387-.517 1.1558-1.1558 1.1558-.6387 0-1.1558-.5171-1.1558-1.1558 0-.6388.5171-1.1559 1.1558-1.1559z"
        />
        <path
          transform="matrix(2.7868 0 0 2.7868 -111.31 -108.86)"
          d="m62.198 60.586c.6388 0 1.1558.5171 1.1558 1.1559 0 .6387-.517 1.1558-1.1558 1.1558-.6387 0-1.1558-.5171-1.1558-1.1558 0-.6388.5171-1.1559 1.1558-1.1559z"
        />
      </g>
      <g className={styles.circle}>
        <path
          transform="matrix(1.4922 0 0 1.4922 -30.794 -63.277)"
          d="m62.198 60.586c.6388 0 1.1558.5171 1.1558 1.1559 0 .6387-.517 1.1558-1.1558 1.1558-.6387 0-1.1558-.5171-1.1558-1.1558 0-.6388.5171-1.1559 1.1558-1.1559z"
        />
        <path
          transform="matrix(1.4922 0 0 1.4922 -30.794 -46.209)"
          d="m62.198 60.586c.6388 0 1.1558.5171 1.1558 1.1559 0 .6387-.517 1.1558-1.1558 1.1558-.6387 0-1.1558-.5171-1.1558-1.1558 0-.6388.5171-1.1559 1.1558-1.1559z"
        />
        <path
          transform="matrix(1.4922 0 0 1.4922 -30.794 -28.93)"
          d="m62.198 60.586c.6388 0 1.1558.5171 1.1558 1.1559 0 .6387-.517 1.1558-1.1558 1.1558-.6387 0-1.1558-.5171-1.1558-1.1558 0-.6388.5171-1.1559 1.1558-1.1559z"
        />
      </g>
    </g>
  );
};
