import { loaded } from '../../utils';
import { harness } from '../_utils/_harness';

harness('playlist page', () => {
  it('should load and have right title', async () => {
    await loaded();

    const playlistName = await app.client.element('#sidebar #playlists div:first-child span').getText();

    return app.client
      .element('#sidebar #playlists  div:first-child a')
      .click()
      .waitUntilWindowLoaded()
      .getText('.page-header h2')
      .should.eventually.contain(playlistName);
  });
});
