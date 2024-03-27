import UFuzzy from '@leeoniya/ufuzzy';

import type { Monaco } from '@grafana/ui';

import { SUGGESTIONS_LIMIT } from '../../../language_provider';
import { escapeLabelValueInExactSelector } from '../../../language_utils';
import { FUNCTIONS } from '../../../promql';

import type { Label, Situation } from './situation';
import { NeverCaseError } from './util';
// FIXME: we should not load this from the "outside", but we cannot do that while we have the "old" query-field too

export type CompletionType = 'HISTORY' | 'FUNCTION' | 'METRIC_NAME' | 'DURATION' | 'LABEL_NAME' | 'LABEL_VALUE';

type Completion = {
  type: CompletionType;
  label: string;
  insertText: string;
  detail?: string;
  documentation?: string;
  triggerOnInsert?: boolean;
};

type Metric = {
  name: string;
  help: string;
  type: string;
};

export type DataProvider = {
  getHistory: () => Promise<string[]>;
  getAllMetricNames: () => Promise<Metric[]>;
  getAllLabelNames: () => Promise<string[]>;
  getLabelValues: (labelName: string) => Promise<string[]>;
  getSeriesValues: (name: string, match: string) => Promise<string[]>;
  getSeriesLabels: (selector: string, otherLabels: Label[]) => Promise<string[]>;
};

const metricNamesSearchClient = new UFuzzy({
  intraMode: 1,
  intraChars: '[a-z0-9_:]', // characters allowed in metric names, according to the Prometheus data model
});

export function fuzzySearchMetrics(haystack: Metric[], needle: string): Metric[] {
  const filteredMetrics: Metric[] = [];
  const metricNames = haystack.map((metric) => metric.name);
  const [idxs] = metricNamesSearchClient.search(metricNames, needle);

  for (const idx of idxs ?? []) {
    const metric = haystack.at(idx);

    if (metric && filteredMetrics.length < SUGGESTIONS_LIMIT) {
      filteredMetrics.push(metric);
    }
  }

  return filteredMetrics;
}

// we order items like: history, functions, metrics
async function getAllMetricNamesCompletions(
  dataProvider: DataProvider,
  textInput: string,
  enableAutocompleteSuggestionsUpdate: () => void
): Promise<Completion[]> {
  let metrics = await dataProvider.getAllMetricNames();

  if (metrics.length > SUGGESTIONS_LIMIT) {
    if (textInput) {
      enableAutocompleteSuggestionsUpdate();
      metrics = fuzzySearchMetrics(metrics, textInput);
    } else {
      metrics = metrics.slice(0, SUGGESTIONS_LIMIT);
    }
  }

  return metrics.map((metric) => ({
    type: 'METRIC_NAME',
    label: metric.name,
    insertText: metric.name,
    detail: `${metric.name} : ${metric.type}`,
    documentation: metric.help,
  }));
}

const FUNCTION_COMPLETIONS: Completion[] = FUNCTIONS.map((f) => ({
  type: 'FUNCTION',
  label: f.label,
  insertText: f.insertText ?? '', // i don't know what to do when this is nullish. it should not be.
  detail: f.detail,
  documentation: f.documentation,
}));

async function getAllFunctionsAndMetricNamesCompletions(
  dataProvider: DataProvider,
  textInput: string,
  enableAutocompleteSuggestionsUpdate: () => void
): Promise<Completion[]> {
  const metricNames = await getAllMetricNamesCompletions(dataProvider, textInput, enableAutocompleteSuggestionsUpdate);

  return [...FUNCTION_COMPLETIONS, ...metricNames];
}

const DURATION_COMPLETIONS: Completion[] = [
  '$__interval',
  '$__range',
  '$__rate_interval',
  '1m',
  '5m',
  '10m',
  '30m',
  '1h',
  '1d',
].map((text) => ({
  type: 'DURATION',
  label: text,
  insertText: text,
}));

async function getAllHistoryCompletions(dataProvider: DataProvider): Promise<Completion[]> {
  // function getAllHistoryCompletions(queryHistory: PromHistoryItem[]): Completion[] {
  // NOTE: the typescript types are wrong. historyItem.query.expr can be undefined
  const allHistory = await dataProvider.getHistory();
  // FIXME: find a better history-limit
  return allHistory.slice(0, 10).map((expr) => ({
    type: 'HISTORY',
    label: expr,
    insertText: expr,
  }));
}

function makeSelector(metricName: string | undefined, labels: Label[]): string {
  const allLabels = [...labels];

  // we transform the metricName to a label, if it exists
  if (metricName !== undefined) {
    allLabels.push({ name: '__name__', value: metricName, op: '=' });
  }

  const allLabelTexts = allLabels.map(
    (label) => `${label.name}${label.op}"${escapeLabelValueInExactSelector(label.value)}"`
  );

  return `{${allLabelTexts.join(',')}}`;
}

async function getLabelNames(
  metric: string | undefined,
  otherLabels: Label[],
  dataProvider: DataProvider
): Promise<string[]> {
  if (metric === undefined && otherLabels.length === 0) {
    // if there is no filtering, we have to use a special endpoint
    return dataProvider.getAllLabelNames();
  } else {
    const selector = makeSelector(metric, otherLabels);
    return await dataProvider.getSeriesLabels(selector, otherLabels);
  }
}

async function getLabelNamesForCompletions(
  metric: string | undefined,
  suffix: string,
  triggerOnInsert: boolean,
  otherLabels: Label[],
  dataProvider: DataProvider
): Promise<Completion[]> {
  const labelNames = await getLabelNames(metric, otherLabels, dataProvider);
  return labelNames.map((text) => ({
    type: 'LABEL_NAME',
    label: text,
    insertText: `${text}${suffix}`,
    triggerOnInsert,
  }));
}

async function getLabelNamesForSelectorCompletions(
  metric: string | undefined,
  otherLabels: Label[],
  dataProvider: DataProvider
): Promise<Completion[]> {
  return getLabelNamesForCompletions(metric, '=', true, otherLabels, dataProvider);
}

async function getLabelNamesForByCompletions(
  metric: string | undefined,
  otherLabels: Label[],
  dataProvider: DataProvider
): Promise<Completion[]> {
  return getLabelNamesForCompletions(metric, '', false, otherLabels, dataProvider);
}

async function getLabelValues(
  metric: string | undefined,
  labelName: string,
  otherLabels: Label[],
  dataProvider: DataProvider
): Promise<string[]> {
  if (metric === undefined && otherLabels.length === 0) {
    // if there is no filtering, we have to use a special endpoint
    return dataProvider.getLabelValues(labelName);
  } else {
    const selector = makeSelector(metric, otherLabels);
    return await dataProvider.getSeriesValues(labelName, selector);
  }
}

async function getLabelValuesForMetricCompletions(
  metric: string | undefined,
  labelName: string,
  betweenQuotes: boolean,
  otherLabels: Label[],
  dataProvider: DataProvider
): Promise<Completion[]> {
  const values = await getLabelValues(metric, labelName, otherLabels, dataProvider);
  return values.map((text) => ({
    type: 'LABEL_VALUE',
    label: text,
    insertText: betweenQuotes ? text : `"${text}"`, // FIXME: escaping strange characters?
  }));
}

/**
 * @param situation
 * @param dataProvider
 * @param textInput The text that's been typed so far within the current {@link Monaco.Range | Range}
 */
export async function getCompletions(
  situation: Situation,
  dataProvider: DataProvider,
  textInput: string,
  enableAutocompleteSuggestionsUpdate: () => void
): Promise<Completion[]> {
  switch (situation.type) {
    case 'IN_DURATION':
      return DURATION_COMPLETIONS;
    case 'IN_FUNCTION':
      return getAllFunctionsAndMetricNamesCompletions(dataProvider, textInput, enableAutocompleteSuggestionsUpdate);
    case 'AT_ROOT': {
      return getAllFunctionsAndMetricNamesCompletions(dataProvider, textInput, enableAutocompleteSuggestionsUpdate);
    }
    case 'EMPTY': {
      const metricNames = await getAllMetricNamesCompletions(
        dataProvider,
        textInput,
        enableAutocompleteSuggestionsUpdate
      );
      const historyCompletions = await getAllHistoryCompletions(dataProvider);
      return [...historyCompletions, ...FUNCTION_COMPLETIONS, ...metricNames];
    }
    case 'IN_LABEL_SELECTOR_NO_LABEL_NAME':
      return getLabelNamesForSelectorCompletions(situation.metricName, situation.otherLabels, dataProvider);
    case 'IN_GROUPING':
      return getLabelNamesForByCompletions(situation.metricName, situation.otherLabels, dataProvider);
    case 'IN_LABEL_SELECTOR_WITH_LABEL_NAME':
      return getLabelValuesForMetricCompletions(
        situation.metricName,
        situation.labelName,
        situation.betweenQuotes,
        situation.otherLabels,
        dataProvider
      );
    default:
      throw new NeverCaseError(situation);
  }
}
