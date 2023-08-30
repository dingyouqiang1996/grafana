import { DataSourceInstanceSettings, PluginMetaInfo, PluginType } from '@grafana/data';
import { monacoTypes } from '@grafana/ui';

import { emptyTags, v1Tags, v2Tags } from '../SearchTraceQLEditor/utils.test';
import { TempoDatasource } from '../datasource';
import TempoLanguageProvider from '../language_provider';
import { Scope, TempoJsonData } from '../types';

import { CompletionProvider } from './autocomplete';
import { intrinsics, scopes } from './traceql';

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
}));

describe('CompletionProvider', () => {
  it('suggests tags, intrinsics and scopes (API v1)', async () => {
    const { provider, model } = setup('{}', 1, v1Tags);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual([
      ...scopes.map((s) => expect.objectContaining({ label: s, insertText: s })),
      ...intrinsics.map((s) => expect.objectContaining({ label: s, insertText: s })),
      expect.objectContaining({ label: 'bar', insertText: '.bar' }),
      expect.objectContaining({ label: 'foo', insertText: '.foo' }),
      expect.objectContaining({ label: 'status', insertText: '.status' }),
    ]);
  });

  it('suggests tags, intrinsics and scopes (API v2)', async () => {
    const { provider, model } = setup('{}', 1, undefined, v2Tags);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual([
      ...scopes.map((s) => expect.objectContaining({ label: s, insertText: s })),
      ...intrinsics.map((s) => expect.objectContaining({ label: s, insertText: s })),
      expect.objectContaining({ label: 'cluster', insertText: '.cluster' }),
      expect.objectContaining({ label: 'container', insertText: '.container' }),
      expect.objectContaining({ label: 'db', insertText: '.db' }),
    ]);
  });

  it('does not wrap the tag value in quotes if the type in the response is something other than "string"', async () => {
    const { provider, model } = setup('{.foo=}', 6, v1Tags);

    jest.spyOn(provider.languageProvider, 'getOptionsV2').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolve([
            {
              type: 'int',
              value: 'foobar',
              label: 'foobar',
            },
          ]);
        })
    );

    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual([
      expect.objectContaining({ label: 'foobar', insertText: 'foobar' }),
    ]);
  });

  it('wraps the tag value in quotes if the type in the response is set to "string"', async () => {
    const { provider, model } = setup('{.foo=}', 6, v1Tags);

    jest.spyOn(provider.languageProvider, 'getOptionsV2').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolve([
            {
              type: 'string',
              value: 'foobar',
              label: 'foobar',
            },
          ]);
        })
    );

    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual([
      expect.objectContaining({ label: 'foobar', insertText: '"foobar"' }),
    ]);
  });

  it('inserts the tag value without quotes if the user has entered quotes', async () => {
    const { provider, model } = setup('{.foo="}', 6, v1Tags);

    jest.spyOn(provider.languageProvider, 'getOptionsV2').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolve([
            {
              value: 'foobar',
              label: 'foobar',
            },
          ]);
        })
    );

    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual([
      expect.objectContaining({ label: 'foobar', insertText: 'foobar' }),
    ]);
  });

  it('suggests nothing without tags', async () => {
    const { provider, model } = setup('{.foo="}', 8, emptyTags);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual([]);
  });

  it('suggests tags on empty input (API v1)', async () => {
    const { provider, model } = setup('', 0, v1Tags);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual([
      ...scopes.map((s) => expect.objectContaining({ label: s, insertText: `{ ${s}` })),
      ...intrinsics.map((s) => expect.objectContaining({ label: s, insertText: `{ ${s}` })),
      expect.objectContaining({ label: 'bar', insertText: '{ .bar' }),
      expect.objectContaining({ label: 'foo', insertText: '{ .foo' }),
      expect.objectContaining({ label: 'status', insertText: '{ .status' }),
    ]);
  });

  it('suggests tags on empty input (API v2)', async () => {
    const { provider, model } = setup('', 0, undefined, v2Tags);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual([
      ...scopes.map((s) => expect.objectContaining({ label: s, insertText: `{ ${s}` })),
      ...intrinsics.map((s) => expect.objectContaining({ label: s, insertText: `{ ${s}` })),
      expect.objectContaining({ label: 'cluster', insertText: '{ .cluster' }),
      expect.objectContaining({ label: 'container', insertText: '{ .container' }),
      expect.objectContaining({ label: 'db', insertText: '{ .db' }),
    ]);
  });

  it('only suggests tags after typing the global attribute scope (API v1)', async () => {
    const { provider, model } = setup('{.}', 2, v1Tags);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual(
      v1Tags.map((s) => expect.objectContaining({ label: s, insertText: s }))
    );
  });

  it('only suggests tags after typing the global attribute scope (API v2)', async () => {
    const { provider, model } = setup('{.}', 2, undefined, v2Tags);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual(
      ['cluster', 'container', 'db'].map((s) => expect.objectContaining({ label: s, insertText: s }))
    );
  });

  it.each([
    ['{ .foo }', 6],
    ['{ .foo }', 7],
    ['{ .foo = 1 && .bar }', 18],
    ['{ .foo = 1 && .bar }', 19],
  ])('suggests operators after tag name', async (input: string, offset: number) => {
    const { provider, model } = setup(input, offset, v1Tags);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual(
      [...CompletionProvider.comparisonOps, ...CompletionProvider.logicalOps, ...CompletionProvider.arithmeticOps].map(
        (s) => expect.objectContaining({ label: s.label, insertText: s.insertText })
      )
    );
  });

  it('suggests tags after a scope (API v1)', async () => {
    const { provider, model } = setup('{ resource. }', 11, v1Tags);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual(
      v1Tags.map((s) => expect.objectContaining({ label: s, insertText: s }))
    );
  });

  it('suggests correct tags after the resource scope (API v2)', async () => {
    const { provider, model } = setup('{ resource. }', 11, undefined, v2Tags);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual(
      ['cluster', 'container'].map((s) => expect.objectContaining({ label: s, insertText: s }))
    );
  });

  it('suggests correct tags after the span scope (API v2)', async () => {
    const { provider, model } = setup('{ span. }', 7, undefined, v2Tags);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual(
      ['db'].map((s) => expect.objectContaining({ label: s, insertText: s }))
    );
  });

  it('suggests logical operators and close bracket after the value', async () => {
    const { provider, model } = setup('{.foo=300 }', 10, v1Tags);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual(
      [...CompletionProvider.logicalOps, ...CompletionProvider.arithmeticOps, ...CompletionProvider.comparisonOps].map(
        (s) => expect.objectContaining({ label: s.label, insertText: s.insertText })
      )
    );
  });

  it('suggests spanset combining operators after spanset selector', async () => {
    const { provider, model } = setup('{.foo=300} ', 11);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual(
      CompletionProvider.spansetOps.map((s) => expect.objectContaining({ label: s.label, insertText: s.insertText }))
    );
  });

  it.each([
    ['{.foo=300} | ', 13],
    ['{.foo=300} && {.bar=200} | ', 27],
    ['{.foo=300} && {.bar=300} && {.foo=300} | ', 41],
  ])('suggests operators that go after `|` (aggregators, selectorts, ...)', async (input: string, offset: number) => {
    const { provider, model } = setup(input, offset);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual(
      CompletionProvider.functions.map((s) =>
        expect.objectContaining({ label: s.label, insertText: s.insertText, documentation: s.documentation })
      )
    );
  });

  it.each([
    ['{.foo=300} | avg(.value) ', 25],
    ['{.foo=300} && {.foo=300} | avg(.value) ', 39],
  ])('suggests comparison operators after aggregator (avg, max, ...)', async (input: string, offset: number) => {
    const { provider, model } = setup(input, offset);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual(
      CompletionProvider.comparisonOps.map((s) => expect.objectContaining({ label: s.label, insertText: s.insertText }))
    );
  });

  it.each([
    ['{.foo=300} | avg(.value) = ', 27],
    ['{.foo=300} && {.foo=300} | avg(.value) = ', 41],
  ])('does not suggest after aggregator and comparison operator', async (input: string, offset: number) => {
    const { provider, model } = setup(input, offset);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual([]);
  });

  it('suggests to complete spanset', async () => {
    const { provider, model } = setup('{ .foo = 1 && .bar  }', 19);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual(
      [...CompletionProvider.comparisonOps, ...CompletionProvider.logicalOps, ...CompletionProvider.arithmeticOps].map(
        (s) => expect.objectContaining({ label: s.label, insertText: s.insertText })
      )
    );
  });

  it.each([
    ['{.foo   300}', 5],
    ['{.foo   300}', 6],
    ['{.foo   300}', 7],
    ['{.foo   300}', 8],
    ['{.foo  300 && .bar = 200}', 5],
    ['{.foo  300 && .bar = 200}', 6],
    ['{.foo  300 && .bar = 200}', 7],
    ['{.foo  300 && .bar  200}', 18],
    ['{.foo  300 && .bar  200}', 19],
    ['{.foo  300 && .bar  200}', 20],
  ])('suggests with incomplete spanset', async (input: string, offset: number) => {
    const { provider, model } = setup(input, offset);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual(
      [...CompletionProvider.comparisonOps, ...CompletionProvider.logicalOps, ...CompletionProvider.arithmeticOps].map(
        (s) => expect.objectContaining({ label: s.label, insertText: s.insertText })
      )
    );
  });

  it('suggests when `}` missing', async () => {
    const { provider, model } = setup('{ span.http.status_code ', 24);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual(
      [...CompletionProvider.comparisonOps, ...CompletionProvider.logicalOps].map((s) =>
        expect.objectContaining({ label: s.label, insertText: s.insertText })
      )
    );
  });

  it.each([
    ['{ span.http.status_code = 200 &&  }', 33],
    ['{ span.http.status_code = 200 ||  }', 33],
    ['{ span.http.status_code = 200 &&   }', 34],
    ['{ span.http.status_code = 200 ||   }', 34],
    ['{ span.http.status_code = 200 &&   }', 35],
    ['{ span.http.status_code = 200 ||   }', 35],
  ])('suggests scope after field expression in span', async (input: string, offset: number) => {
    const { provider, model } = setup(input, offset);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual([
      ...scopes.map((s) => expect.objectContaining({ label: s, insertText: s })),
      ...intrinsics.map((s) => expect.objectContaining({ label: s, insertText: s })),
    ]);
  });

  it.each([
    ['{.foo=1} | avg()', 15],
    ['{.foo=1} | avg() < 1s', 15],
    ['{.foo=1} | max() = 3', 15],
    ['{.foo=1} | by()', 14],
    ['{.foo=1} | select()', 18],
  ])('suggests attributes inside function parentheses', async (input: string, offset: number) => {
    const { provider, model } = setup(input, offset);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual([
      ...scopes.map((s) => expect.objectContaining({ label: s, insertText: s })),
      ...intrinsics.map((s) => expect.objectContaining({ label: s, insertText: s })),
    ]);
  });

  it.each([
    ['{.foo=1}  {.bar=2}', 8],
    ['{.foo=1}  {.bar=2}', 9],
    ['{.foo=1}  {.bar=2}', 10],
  ])(
    'suggests spanset combining operators in an incomplete, multi-spanset query',
    async (input: string, offset: number) => {
      const { provider, model } = setup(input, offset);
      const result = await provider.provideCompletionItems(
        model as unknown as monacoTypes.editor.ITextModel,
        {} as monacoTypes.Position
      );
      expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual(
        [...CompletionProvider.spansetOps].map((s) =>
          expect.objectContaining({ label: s.label, insertText: s.insertText })
        )
      );
    }
  );

  it.each([
    ['{ .foo = 200 } &&  ', 18],
    ['{ .foo = 200 } &&  ', 19],
    ['{ .foo = 200 } || ', 18],
    ['{ .foo = 200 } >> ', 18],
  ])('suggests new spanset after multi-spanset operator', async (input: string, offset: number) => {
    const { provider, model } = setup(input, offset);
    const result = await provider.provideCompletionItems(
      model as unknown as monacoTypes.editor.ITextModel,
      {} as monacoTypes.Position
    );
    expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual([
      ...scopes.map((s) => expect.objectContaining({ label: s })),
      ...intrinsics.map((s) => expect.objectContaining({ label: s })),
    ]);
  });

  it.each([['{ .foo = 1 } &&  { .bar = 2 }', 16]])(
    'suggests between spansets with complete query',
    async (input: string, offset: number) => {
      const { provider, model } = setup(input, offset);
      const result = await provider.provideCompletionItems(
        model as unknown as monacoTypes.editor.ITextModel,
        {} as monacoTypes.Position
      );
      expect((result! as monacoTypes.languages.CompletionList).suggestions).toEqual([
        ...scopes.map((s) => expect.objectContaining({ label: s })),
        ...intrinsics.map((s) => expect.objectContaining({ label: s })),
      ]);
    }
  );
});

function setup(value: string, offset: number, tagsV1?: string[], tagsV2?: Scope[]) {
  const ds = new TempoDatasource(defaultSettings);
  const lp = new TempoLanguageProvider(ds);
  if (tagsV1) {
    lp.setV1Tags(tagsV1);
  } else if (tagsV2) {
    lp.setV2Tags(tagsV2);
  }
  const provider = new CompletionProvider({ languageProvider: lp });
  const model = makeModel(value, offset);
  provider.monaco = {
    Range: {
      fromPositions() {
        return null;
      },
    },
    languages: {
      CompletionItemKind: {
        Enum: 1,
        EnumMember: 2,
      },
    },
  } as any;
  provider.editor = {
    getModel() {
      return model;
    },
  } as any;

  return { provider, model };
}

function makeModel(value: string, offset: number) {
  return {
    id: 'test_monaco',
    getWordAtPosition() {
      return null;
    },
    getOffsetAt() {
      return offset;
    },
    getValue() {
      return value;
    },
  };
}

const defaultSettings: DataSourceInstanceSettings<TempoJsonData> = {
  id: 0,
  uid: 'gdev-tempo',
  type: 'tracing',
  name: 'tempo',
  access: 'proxy',
  meta: {
    id: 'tempo',
    name: 'tempo',
    type: PluginType.datasource,
    info: {} as PluginMetaInfo,
    module: '',
    baseUrl: '',
  },
  readOnly: false,
  jsonData: {
    nodeGraph: {
      enabled: true,
    },
  },
};
