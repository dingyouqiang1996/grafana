describe('useStateSync', () => {});

// describe('handles url change', () => {
//     const urlParams = { left: JSON.stringify(['now-1h', 'now', 'loki', { expr: '{ label="value"}' }]) };

//     it('and runs the new query', async () => {
//       const { datasources } = setupExplore({ urlParams });
//       jest.mocked(datasources.loki.query).mockReturnValueOnce(makeLogsQueryResponse());
//       // Wait for rendering the logs
//       await screen.findByText(/custom log line/i);

//       jest.mocked(datasources.loki.query).mockReturnValueOnce(makeLogsQueryResponse('different log'));

//       act(() => {
//         locationService.partial({
//           left: JSON.stringify(['now-1h', 'now', 'loki', { expr: '{ label="different"}' }]),
//         });
//       });

//       // Editor renders the new query
//       await screen.findByText(`loki Editor input: { label="different"}`);
//       // Renders new response
//       await screen.findByText(/different log/i);
//     });

//     it('and runs the new query with different datasource', async () => {
//       const { datasources } = setupExplore({ urlParams });
//       jest.mocked(datasources.loki.query).mockReturnValueOnce(makeLogsQueryResponse());
//       // Wait for rendering the logs
//       await screen.findByText(/custom log line/i);
//       await screen.findByText(`loki Editor input: { label="value"}`);

//       jest.mocked(datasources.elastic.query).mockReturnValueOnce(makeMetricsQueryResponse());

//       act(() => {
//         locationService.partial({
//           left: JSON.stringify(['now-1h', 'now', 'elastic', { expr: 'other query' }]),
//         });
//       });

//       // Editor renders the new query
//       await screen.findByText(`elastic Editor input: other query`);
//       // Renders graph
//       await screen.findByText(/Graph/i);
//     });
//   });

// it('Reacts to URL changes and opens a pane if an entry is pushed to history', async () => {
//     const urlParams = {
//       left: JSON.stringify(['now-1h', 'now', 'loki', { expr: '{ label="value"}' }]),
//     };
//     const { datasources, location } = setupExplore({ urlParams });
//     jest.mocked(datasources.loki.query).mockReturnValue(makeLogsQueryResponse());
//     jest.mocked(datasources.elastic.query).mockReturnValue(makeLogsQueryResponse());

//     await waitFor(() => {
//       expect(screen.getByText(`loki Editor input: { label="value"}`)).toBeInTheDocument();
//     });

//     act(() => {
//       location.partial({
//         left: JSON.stringify(['now-1h', 'now', 'loki', { expr: '{ label="value"}' }]),
//         right: JSON.stringify(['now-1h', 'now', 'elastic', { expr: 'error' }]),
//       });
//     });

//     await waitFor(() => {
//       expect(screen.getByText(`loki Editor input: { label="value"}`)).toBeInTheDocument();
//       expect(screen.getByText(`elastic Editor input: error`)).toBeInTheDocument();
//     });
//   });

// describe('Handles different URL datasource redirects', () => {
//     describe('exploreMixedDatasource on', () => {
//       beforeAll(() => {
//         config.featureToggles.exploreMixedDatasource = true;
//       });

//       describe('When root datasource is not specified in the URL', () => {
//         it('Redirects to default datasource', async () => {
//           const { location } = setupExplore({ mixedEnabled: true });
//           await waitForExplore();

//           await waitFor(() => {
//             const urlParams = decodeURIComponent(location.getSearch().toString());

//             expect(urlParams).toBe(
//               'left={"datasource":"loki-uid","queries":[{"refId":"A","datasource":{"type":"logs","uid":"loki-uid"}}],"range":{"from":"now-1h","to":"now"}}&orgId=1'
//             );
//           });
//           expect(location.getHistory()).toHaveLength(1);
//         });

//         it('Redirects to last used datasource when available', async () => {
//           const { location } = setupExplore({
//             prevUsedDatasource: { orgId: 1, datasource: 'elastic-uid' },
//             mixedEnabled: true,
//           });
//           await waitForExplore();

//           await waitFor(() => {
//             const urlParams = decodeURIComponent(location.getSearch().toString());
//             expect(urlParams).toBe(
//               'left={"datasource":"elastic-uid","queries":[{"refId":"A","datasource":{"type":"logs","uid":"elastic-uid"}}],"range":{"from":"now-1h","to":"now"}}&orgId=1'
//             );
//           });
//           expect(location.getHistory()).toHaveLength(1);
//         });

//         it("Redirects to first query's datasource", async () => {
//           const { location } = setupExplore({
//             urlParams: {
//               left: '{"queries":[{"refId":"A","datasource":{"type":"logs","uid":"loki-uid"}}],"range":{"from":"now-1h","to":"now"}}',
//             },
//             prevUsedDatasource: { orgId: 1, datasource: 'elastic' },
//             mixedEnabled: true,
//           });
//           await waitForExplore();

//           await waitFor(() => {
//             const urlParams = decodeURIComponent(location.getSearch().toString());
//             expect(urlParams).toBe(
//               'left={"datasource":"loki-uid","queries":[{"refId":"A","datasource":{"type":"logs","uid":"loki-uid"}}],"range":{"from":"now-1h","to":"now"}}&orgId=1'
//             );
//           });
//           expect(location.getHistory()).toHaveLength(1);
//         });
//       });

//       describe('When root datasource is specified in the URL', () => {
//         it('Uses the datasource in the URL', async () => {
//           const { location } = setupExplore({
//             urlParams: {
//               left: '{"datasource":"elastic-uid","queries":[{"refId":"A"}],"range":{"from":"now-1h","to":"now"}}',
//             },
//             prevUsedDatasource: { orgId: 1, datasource: 'elastic' },
//             mixedEnabled: true,
//           });
//           await waitForExplore();

//           await waitFor(() => {
//             const urlParams = decodeURIComponent(location.getSearch().toString());
//             expect(urlParams).toBe(
//               'left={"datasource":"elastic-uid","queries":[{"refId":"A"}],"range":{"from":"now-1h","to":"now"}}&orgId=1'
//             );
//           });

//           expect(location.getHistory()).toHaveLength(1);
//         });

//         it('Filters out queries not using the root datasource', async () => {
//           const { location } = setupExplore({
//             urlParams: {
//               left: '{"datasource":"elastic-uid","queries":[{"refId":"A","datasource":{"type":"logs","uid":"loki-uid"}},{"refId":"B","datasource":{"type":"logs","uid":"elastic-uid"}}],"range":{"from":"now-1h","to":"now"}}',
//             },
//             prevUsedDatasource: { orgId: 1, datasource: 'elastic' },
//             mixedEnabled: true,
//           });
//           await waitForExplore();

//           await waitFor(() => {
//             const urlParams = decodeURIComponent(location.getSearch().toString());
//             expect(urlParams).toBe(
//               'left={"datasource":"elastic-uid","queries":[{"refId":"B","datasource":{"type":"logs","uid":"elastic-uid"}}],"range":{"from":"now-1h","to":"now"}}&orgId=1'
//             );
//           });
//         });

//         it('Fallbacks to last used datasource if root datasource does not exist', async () => {
//           const { location } = setupExplore({
//             urlParams: { left: '{"datasource":"NON-EXISTENT","range":{"from":"now-1h","to":"now"}}' },
//             prevUsedDatasource: { orgId: 1, datasource: 'elastic' },
//             mixedEnabled: true,
//           });
//           await waitForExplore();

//           await waitFor(() => {
//             const urlParams = decodeURIComponent(location.getSearch().toString());
//             expect(urlParams).toBe(
//               'left={"datasource":"elastic-uid","queries":[{"refId":"A","datasource":{"type":"logs","uid":"elastic-uid"}}],"range":{"from":"now-1h","to":"now"}}&orgId=1'
//             );
//           });
//         });

//         it('Fallbacks to default datasource if root datasource does not exist and last used datasource does not exist', async () => {
//           const { location } = setupExplore({
//             urlParams: { left: '{"datasource":"NON-EXISTENT","range":{"from":"now-1h","to":"now"}}' },
//             prevUsedDatasource: { orgId: 1, datasource: 'I DO NOT EXIST' },
//             mixedEnabled: true,
//           });
//           await waitForExplore();

//           await waitFor(() => {
//             const urlParams = decodeURIComponent(location.getSearch().toString());
//             expect(urlParams).toBe(
//               'left={"datasource":"loki-uid","queries":[{"refId":"A","datasource":{"type":"logs","uid":"loki-uid"}}],"range":{"from":"now-1h","to":"now"}}&orgId=1'
//             );
//           });
//         });

//         it('Fallbacks to default datasource if root datasource does not exist there is no last used datasource', async () => {
//           const { location } = setupExplore({
//             urlParams: { left: '{"datasource":"NON-EXISTENT","range":{"from":"now-1h","to":"now"}}' },
//             mixedEnabled: true,
//           });
//           await waitForExplore();

//           await waitFor(() => {
//             const urlParams = decodeURIComponent(location.getSearch().toString());
//             expect(urlParams).toBe(
//               'left={"datasource":"loki-uid","queries":[{"refId":"A","datasource":{"type":"logs","uid":"loki-uid"}}],"range":{"from":"now-1h","to":"now"}}&orgId=1'
//             );
//           });
//         });
//       });

//       it('Queries using nonexisting datasources gets removed', async () => {
//         const { location } = setupExplore({
//           urlParams: {
//             left: '{"datasource":"-- Mixed --","queries":[{"refId":"A","datasource":{"type":"NON-EXISTENT","uid":"NON-EXISTENT"}},{"refId":"B","datasource":{"type":"logs","uid":"elastic-uid"}}],"range":{"from":"now-1h","to":"now"}}',
//           },
//           prevUsedDatasource: { orgId: 1, datasource: 'elastic' },
//           mixedEnabled: true,
//         });
//         await waitForExplore();

//         await waitFor(() => {
//           const urlParams = decodeURIComponent(location.getSearch().toString());
//           expect(urlParams).toBe(
//             'left={"datasource":"--+Mixed+--","queries":[{"refId":"B","datasource":{"type":"logs","uid":"elastic-uid"}}],"range":{"from":"now-1h","to":"now"}}&orgId=1'
//           );
//         });
//       });

//       it('Only keeps queries using root datasource', async () => {
//         const { location } = setupExplore({
//           urlParams: {
//             left: '{"datasource":"elastic-uid","queries":[{"refId":"A","datasource":{"type":"logs","uid":"loki-uid"}},{"refId":"B","datasource":{"type":"logs","uid":"elastic-uid"}}],"range":{"from":"now-1h","to":"now"}}',
//           },
//           prevUsedDatasource: { orgId: 1, datasource: 'elastic' },
//           mixedEnabled: true,
//         });

//         await waitForExplore(undefined, true);

//         await waitFor(() => {
//           const urlParams = decodeURIComponent(location.getSearch().toString());
//           // because there are no import/export queries in our mock datasources, only the first one remains

//           expect(urlParams).toBe(
//             'left={"datasource":"elastic-uid","queries":[{"refId":"B","datasource":{"type":"logs","uid":"elastic-uid"}}],"range":{"from":"now-1h","to":"now"}}&orgId=1'
//           );
//         });
//       });
//     });
//   });

// describe('exploreMixedDatasource off', () => {
//     beforeAll(() => {
//       config.featureToggles.exploreMixedDatasource = false;
//     });

//     it('Redirects to the first query datasource if the root is mixed', async () => {
//       const { location } = setupExplore({
//         urlParams: {
//           left: '{"datasource":"-- Mixed --","queries":[{"refId":"A","datasource":{"type":"logs","uid":"elastic-uid"}},{"refId":"B","datasource":{"type":"logs","uid":"loki-uid"}}],"range":{"from":"now-1h","to":"now"}}',
//         },
//         mixedEnabled: false,
//       });

//       await waitForExplore();

//       await waitFor(() => {
//         const urlParams = decodeURIComponent(location.getSearch().toString());

//         expect(urlParams).toBe(
//           'left={"datasource":"elastic-uid","queries":[{"refId":"A","datasource":{"type":"logs","uid":"elastic-uid"}}],"range":{"from":"now-1h","to":"now"}}&orgId=1'
//         );
//       });
//     });

//     it('Redirects to the default datasource if the root is mixed and there are no queries', async () => {
//       const { location } = setupExplore({
//         urlParams: {
//           left: '{"datasource":"-- Mixed --","range":{"from":"now-1h","to":"now"}}',
//         },
//         mixedEnabled: false,
//       });

//       await waitForExplore();

//       await waitFor(() => {
//         const urlParams = decodeURIComponent(location.getSearch().toString());

//         expect(urlParams).toBe(
//           'left={"datasource":"loki-uid","queries":[{"refId":"A","datasource":{"type":"logs","uid":"loki-uid"}}],"range":{"from":"now-1h","to":"now"}}&orgId=1'
//         );
//       });
//     });
//   });
