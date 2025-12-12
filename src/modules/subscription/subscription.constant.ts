import { NestedFilter, rangeFilteringPrams } from '@/utils/queryBuilder';

// Fields for basic filtering
export const SubscriptionFilterFields = [];

// Fields for top-level search
export const SubscriptionSearchFields = ['username', 'email'];

// Nested filtering config
export const SubscriptionNestedFilters: NestedFilter[] = [];

// Range-based filtering config
export const SubscriptionRangeFilter: rangeFilteringPrams[] = [
  {
    field: 'createdAt',
    maxQueryKey: 'maxDate',
    minQueryKey: 'minDate',
    dataType: 'date',
  },
];

// Prisma include configuration
export const SubscriptionInclude = {
  admin: true,
  trader: true,
};


