import { e2e } from '../utils';

describe('Trace view', () => {
  it('Can lazy load big traces', () => {
    e2e.flows.login('admin', 'admin');
    cy.intercept('GET', '**/api/traces/trace', {
      fixture: 'long-trace-response.json',
    }).as('longTrace');

    e2e.pages.Explore.visit();

    e2e.components.DataSourcePicker.container().should('be.visible').type('gdev-jaeger{enter}');
    // Wait for the query editor to be set correctly
    e2e.components.QueryEditorRows.rows().within(() => {
      cy.contains('gdev-jaeger').should('be.visible');
    });

    // Use shift+enter to execute the query as it's more stable than clicking the execute button
    e2e.components.QueryField.container().should('be.visible').type('trace{shift+enter}');

    cy.wait('@longTrace');

    e2e.components.TraceViewer.spanBar().should('be.visible');

    e2e.components.TraceViewer.spanBar()
      .its('length')
      .then((oldLength) => {
        e2e.pages.Explore.General.scrollView().children('.scrollbar-view').scrollTo('center');

        // After scrolling we should load more spans
        e2e.components.TraceViewer.spanBar().should(($span) => {
          expect($span.length).to.be.gt(oldLength);
        });
      });
  });
});
