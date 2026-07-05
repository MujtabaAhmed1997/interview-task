import { openApiEnumSchemas } from './schemas-enums';
import { openApiRequestSchemas } from './schemas-requests';
import { openApiResponseSchemas } from './schemas-responses';

export const openApiSchemas = {
  ...openApiEnumSchemas,
  ...openApiRequestSchemas,
  ...openApiResponseSchemas,
};
