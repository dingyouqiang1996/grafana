import { Selector } from './selector';
import { Url } from './url';

export type Selectors = Record<string, string | Function>;
export type PageObjects<S> = { [P in keyof S]: () => Cypress.Chainable<JQuery<HTMLElement>> };
export type Visit = { visit: () => Cypress.Chainable<Window> };
export type PageFactory<S> = Visit & PageObjects<S>;

export interface PageFactoryArgs<S extends Selectors> {
  url?: string;
  selectors: S;
}

export const pageFactory = <S extends Selectors>({ url, selectors }: PageFactoryArgs<S>): PageFactory<S> => {
  const visit = () => cy.visit(Url.fromBaseUrl(url));
  const pageObjects: PageObjects<S> = {} as PageObjects<S>;
  const keys = Object.keys(selectors);

  keys.forEach(key => {
    const value = selectors[key];
    if (typeof value === 'string') {
      // @ts-ignore
      pageObjects[key] = () => cy.get(Selector.fromAriaLabel(value));
    }
    if (typeof value === 'function') {
      // @ts-ignore
      pageObjects[key] = () => cy.get(value());
    }
  });

  return {
    visit,
    ...pageObjects,
  };
};
