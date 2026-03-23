export const Sorting = {
    Updated:  'updated',
    Title:    'titled',
    Rating:   'rating',
    Progress: 'progress',
} as const;

export type Sorting = typeof Sorting[keyof typeof Sorting];
