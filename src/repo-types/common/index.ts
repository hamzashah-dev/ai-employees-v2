import type { ReactNode } from 'react';

/**
 * A utility type that extends a given type `P` with a `children` property.
 * This is used in React components to enforce the `children` prop.
 *
 * @template P - The type to extend with the `children` property. Defaults to `unknown`.
 * @property {ReactNode} children - The children elements to be rendered within the component.
 */
export type PropsWithChildren<P = unknown> = P & {
  children: ReactNode;
};

/**
 * A utility type that extends a given type `P` with an optional `children` property.
 * This is used in React components to enforce the `children` prop.
 *
 * @template P - The type to extend with the `children` property. Defaults to `unknown`.
 * @property {ReactNode} children - The children elements to be rendered within the component.
 */
export type PropsWithOptionalChildren<P = unknown> = P & {
  children?: ReactNode;
};

/**
 * Interface representing the properties for a component with optional classname.
 */
export interface PropsWithClassName {
  className?: string;
}

/**
 * Interface representing the properties for a component with children and optional classname.
 */
export type PropsWithChildrenAndClassName<P = unknown> = PropsWithChildren<P> &
  PropsWithClassName;

export type SearchParams = Record<string, string | string[] | undefined>;

export type PropsWithSearchParams<
  P = Promise<SearchParams>,
  Q = unknown,
> = Q & {
  searchParams: P;
};

export enum MessageRoleEnum {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export type ValueOf<T> = T[keyof T];

export interface ResponsePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
