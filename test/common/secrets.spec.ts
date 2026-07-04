import { isDevelopment, isProduction, isTest, secrets } from '../../src/common/util/secrets';

describe('secrets', () => {
  it('loads the test environment', () => {
    expect(isTest()).toBe(true);
    expect(isDevelopment()).toBe(false);
    expect(isProduction()).toBe(false);
  });

  it('exposes required configuration', () => {
    expect(secrets.jwt.secret).toBeTruthy();
    expect(secrets.db.name).toBe('contest_system');
    expect(secrets.port).toBeGreaterThan(0);
  });
});
