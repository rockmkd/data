import { MonitoringWebPage } from './app.po';

describe('monitoring-web App', () => {
  let page: MonitoringWebPage;

  beforeEach(() => {
    page = new MonitoringWebPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
