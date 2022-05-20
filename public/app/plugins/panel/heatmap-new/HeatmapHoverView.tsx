import React, { useEffect, useRef } from 'react';

import {
  DataFrameType,
  DataFrameView,
  Field,
  FieldType,
  formattedValueToString,
  getFieldDisplayName,
  LinkModel,
} from '@grafana/data';
import { LinkButton, VerticalGroup } from '@grafana/ui';
import { getDashboardSrv } from 'app/features/dashboard/services/DashboardSrv';

import { DataHoverView } from '../geomap/components/DataHoverView';

import { BucketLayout, HeatmapData } from './fields';
import { HeatmapHoverEvent } from './utils';

type Props = {
  data: HeatmapData;
  hover: HeatmapHoverEvent;
  showHistogram?: boolean;
};

export const HeatmapHoverView = (props: Props) => {
  if (props.hover.seriesIdx === 2) {
    return <DataHoverView data={props.data.exemplars} rowIndex={props.hover.dataIdx} />;
  }
  return <HeatmapHoverCell {...props} />;
};

const HeatmapHoverCell = ({ data, hover, showHistogram }: Props) => {
  const index = hover.dataIdx;
  const xField = data.heatmap?.fields[0];
  const yField = data.heatmap?.fields[1];
  const countField = data.heatmap?.fields[2];

  const xDisp = (v: any) => {
    if (xField?.display) {
      return formattedValueToString(xField.display(v));
    }
    if (xField?.type === FieldType.time) {
      const tooltipTimeFormat = 'YYYY-MM-DD HH:mm:ss';
      const dashboard = getDashboardSrv().getCurrent();
      return dashboard?.formatDate(v, tooltipTimeFormat);
    }
    return `${v}`;
  };

  const xVals = xField?.values.toArray();
  const yVals = yField?.values.toArray();
  const countVals = countField?.values.toArray();

  let yDispSrc, yDisp;

  // labeled buckets
  if (data.yAxisValues) {
    yDispSrc = data.yAxisValues;
    yDisp = (v: any) => v;
  } else {
    yDispSrc = yVals;
    yDisp = (v: any) => {
      if (yField?.display) {
        return formattedValueToString(yField.display(v));
      }
      return `${v}`;
    };
  }

  const yValueIdx = index % data.yBucketCount! ?? 0;

  const yMinIdx = data.yLayout === BucketLayout.le ? yValueIdx - 1 : yValueIdx;
  const yMaxIdx = data.yLayout === BucketLayout.le ? yValueIdx : yValueIdx + 1;

  const yBucketMin = yDispSrc?.[yMinIdx];
  const yBucketMax = yDispSrc?.[yMaxIdx];

  const xBucketMin = xVals?.[index];
  const xBucketMax = xBucketMin + data.xBucketSize;

  const count = countVals?.[index];

  const visibleFields = data.heatmap?.fields.filter((f) => !Boolean(f.config.custom?.hideFrom?.tooltip));
  const links: Array<LinkModel<Field>> = [];
  const linkLookup = new Set<string>();

  for (const field of visibleFields ?? []) {
    // TODO: Currently always undefined? (getLinks)
    if (field.getLinks) {
      const v = field.values.get(index);
      const disp = field.display ? field.display(v) : { text: `${v}`, numeric: +v };

      field.getLinks({ calculatedValue: disp, valueRowIndex: index }).forEach((link) => {
        const key = `${link.title}/${link.href}`;
        if (!linkLookup.has(key)) {
          links.push(link);
          linkLookup.add(key);
        }
      });
    }
  }

  let can = useRef<HTMLCanvasElement>(null);

  let histCssWidth = 150;
  let histCssHeight = 50;
  let histCanWidth = Math.round(histCssWidth * devicePixelRatio);
  let histCanHeight = Math.round(histCssHeight * devicePixelRatio);

  useEffect(
    () => {
      if (showHistogram) {
        let histCtx = can.current?.getContext('2d');

        if (histCtx && xVals && yVals && countVals) {
          let fromIdx = index;

          while (xVals[fromIdx--] === xVals[index]) {}

          fromIdx++;

          let toIdx = fromIdx + data.yBucketCount!;

          let maxCount = 0;

          let i = fromIdx;
          while (i < toIdx) {
            let c = countVals[i];
            maxCount = Math.max(maxCount, c);
            i++;
          }

          let pHov = new Path2D();
          let pRest = new Path2D();

          i = fromIdx;
          let j = 0;
          while (i < toIdx) {
            let c = countVals[i];

            if (c > 0) {
              let pctY = c / maxCount;
              let pctX = j / (data.yBucketCount! + 1);

              let p = i === index ? pHov : pRest;

              p.rect(
                Math.round(histCanWidth * pctX),
                Math.round(histCanHeight * (1 - pctY)),
                Math.round(histCanWidth / data.yBucketCount!),
                Math.round(histCanHeight * pctY)
              );
            }

            i++;
            j++;
          }

          histCtx.clearRect(0, 0, histCanWidth, histCanHeight);

          histCtx.fillStyle = '#ffffff80';
          histCtx.fill(pRest);

          histCtx.fillStyle = '#ff000080';
          histCtx.fill(pHov);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index]
  );

  const renderExemplars = () => {
    const exemplarIndex = data.exemplarsMappings?.lookup; //?.[index];
    if (!exemplarIndex || !data.exemplars) {
      return null;
    }

    const ids = exemplarIndex[index];
    if (ids) {
      const view = new DataFrameView(data.exemplars);
      return (
        <ul>
          {ids.map((id) => (
            <li key={id}>
              <pre>{JSON.stringify(view.get(id), null, 2)}</pre>
            </li>
          ))}
        </ul>
      );
    }

    // should not show anything... but for debugging
    return <div>EXEMPLARS: {JSON.stringify(exemplarIndex)}</div>;
  };

  if (data.heatmap?.meta?.type === DataFrameType.HeatmapSparse) {
    return (
      <div>
        <DataHoverView data={data.heatmap} rowIndex={index} />
      </div>
    );
  }

  return (
    <>
      <div>
        <div>{xDisp(xBucketMin)}</div>
        <div>{xDisp(xBucketMax)}</div>
      </div>
      {showHistogram && (
        <canvas
          width={histCanWidth}
          height={histCanHeight}
          ref={can}
          style={{ width: histCanWidth + 'px', height: histCanHeight + 'px' }}
        />
      )}
      <div>
        <div>
          Bucket: {yDisp(yBucketMin)} - {yDisp(yBucketMax)}
        </div>
        <div>
          {getFieldDisplayName(countField!, data.heatmap)}: {count}
        </div>
      </div>
      {renderExemplars()}
      {links.length > 0 && (
        <VerticalGroup>
          {links.map((link, i) => (
            <LinkButton
              key={i}
              icon={'external-link-alt'}
              target={link.target}
              href={link.href}
              onClick={link.onClick}
              fill="text"
              style={{ width: '100%' }}
            >
              {link.title}
            </LinkButton>
          ))}
        </VerticalGroup>
      )}
    </>
  );
};
