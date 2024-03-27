import type { Monaco, monacoTypes } from '@grafana/ui';

import { CompletionType, DataProvider, getCompletions } from './completions';
import { getSituation } from './situation';
import { NeverCaseError } from './util';

export function getSuggestOptions(): monacoTypes.editor.ISuggestOptions {
  return {
    // monaco-editor sometimes provides suggestions automatically, i am not
    // sure based on what, seems to be by analyzing the words already
    // written.
    // to try it out:
    // - enter `go_goroutines{job~`
    // - have the cursor at the end of the string
    // - press ctrl-enter
    // - you will get two suggestions
    // those were not provided by grafana, they are offered automatically.
    // i want to remove those. the only way i found is:
    // - every suggestion-item has a `kind` attribute,
    //   that controls the icon to the left of the suggestion.
    // - items auto-generated by monaco have `kind` set to `text`.
    // - we make sure grafana-provided suggestions do not have `kind` set to `text`.
    // - and then we tell monaco not to show suggestions of kind `text`
    showWords: false,
  };
}

function getMonacoCompletionItemKind(type: CompletionType, monaco: Monaco): monacoTypes.languages.CompletionItemKind {
  switch (type) {
    case 'DURATION':
      return monaco.languages.CompletionItemKind.Unit;
    case 'FUNCTION':
      return monaco.languages.CompletionItemKind.Variable;
    case 'HISTORY':
      return monaco.languages.CompletionItemKind.Snippet;
    case 'LABEL_NAME':
      return monaco.languages.CompletionItemKind.Enum;
    case 'LABEL_VALUE':
      return monaco.languages.CompletionItemKind.EnumMember;
    case 'METRIC_NAME':
      return monaco.languages.CompletionItemKind.Constructor;
    default:
      throw new NeverCaseError(type);
  }
}

export function getCompletionProvider(
  monaco: Monaco,
  dataProvider: DataProvider
): monacoTypes.languages.CompletionItemProvider {
  const provideCompletionItems = (
    model: monacoTypes.editor.ITextModel,
    position: monacoTypes.Position
  ): monacoTypes.languages.ProviderResult<monacoTypes.languages.CompletionList> => {
    const word = model.getWordAtPosition(position);
    const range =
      word != null
        ? monaco.Range.lift({
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          })
        : monaco.Range.fromPositions(position);
    // documentation says `position` will be "adjusted" in `getOffsetAt`
    // i don't know what that means, to be sure i clone it

    const positionClone = {
      column: position.column,
      lineNumber: position.lineNumber,
    };
    const textInRange = model.getValueInRange(range);

    // Check to see if the browser supports window.getSelection()
    if (window.getSelection) {
      const selectedText = window.getSelection()?.toString();
      // If the user has selected text, adjust the cursor position to be at the start of the selection, instead of the end
      if (selectedText && selectedText.length > 0) {
        positionClone.column = positionClone.column - selectedText.length;
      }
    }

    const offset = model.getOffsetAt(positionClone);
    const situation = getSituation(model.getValue(), offset);
    let updateAutocompleteSuggestionsOnInput = false;

    /**
     * Enable autocomplete suggestions update on every input change.
     *
     * @remarks
     * If fuzzy search is used in `getCompletions` to trim down results to improve performance,
     * we need to instruct Monaco to update the completions on every input change, so that the
     * completions reflect the current input.
     */
    function enableAutocompleteSuggestionsUpdate() {
      updateAutocompleteSuggestionsOnInput = true;
    }

    const completionsPromise =
      situation != null
        ? getCompletions(situation, dataProvider, textInRange, enableAutocompleteSuggestionsUpdate)
        : Promise.resolve([]);

    return completionsPromise.then((items) => {
      // monaco by-default alphabetically orders the items.
      // to stop it, we use a number-as-string sortkey,
      // so that monaco keeps the order we use
      const maxIndexDigits = items.length.toString().length;
      const suggestions: monacoTypes.languages.CompletionItem[] = items.map((item, index) => ({
        kind: getMonacoCompletionItemKind(item.type, monaco),
        label: item.label,
        insertText: item.insertText,
        detail: item.detail,
        documentation: item.documentation,
        sortText: index.toString().padStart(maxIndexDigits, '0'), // to force the order we have
        range,
        command: item.triggerOnInsert
          ? {
              id: 'editor.action.triggerSuggest',
              title: '',
            }
          : undefined,
      }));
      return { suggestions, incomplete: updateAutocompleteSuggestionsOnInput };
    });
  };

  return {
    triggerCharacters: ['{', ',', '[', '(', '=', '~', ' ', '"'],
    provideCompletionItems,
  };
}
