export const leaderboardOpenApi = {
  '/contests/{id}/leaderboard': {
    get: { tags: ['Leaderboard'], summary: 'Ranked leaderboard for a contest (public, paginated, cached)', security: [] },
  },
};
