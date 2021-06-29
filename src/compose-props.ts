import { ParsedUrlQuery } from "node:querystring";

import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
  Redirect,
} from "next/types";

type Props = Record<string, any>;

type Context =
  | GetStaticPropsContext<ParsedUrlQuery>
  | GetServerSidePropsContext<ParsedUrlQuery>;

type Result =
  | GetStaticPropsResult<Props>
  | GetServerSidePropsResult<Props>;

export function composeProps(...fns: (GetStaticProps | GetServerSideProps)[]) {
  const propsMap = new Map();
  let redirect: Redirect | null = null;
  let revalidate: number | boolean = false;

  return async <T extends (GetStaticProps | GetServerSideProps)>(
    context: Context,
  ) => {
    // Map the page context to each function
    const fnsWithContext = fns.map((
      fn: T extends GetStaticProps ? GetStaticProps : GetServerSideProps,
    ) => fn(context));

    // Iterate through each async function
    for await (const result of fnsWithContext) {
      try {
        // If we encounter notFound, immediately return
        if ("notFound" in result) {
          return {
            notFound: result.notFound,
          };
        }

        // If a page has Incremental Static Regeneration enabled, set the
        // revalidate variable to the revalidate prop. If this is not falsey,
        // it will be folded into the result at the end. This is not valid for
        // 'getServerSideProps'
        if ("revalidate" in result) {
          revalidate = result.revalidate;
        }

        if ("redirect" in result) {
          redirect = result.redirect;
        }

        if ("props" in result) {
          for (const key of Object.keys(result.props)) {
            propsMap.set(key, result.props[key]);
          }
        }
      } catch (error) {
        throw new Error(error);
      }
    }

    // Create a new result object
    let result: Partial<Result> = {};

    // Method must return 'redirect' or 'props'
    if (redirect !== null) {
      result = { redirect };
    } else {
      result = { props: Object.fromEntries(propsMap) };
    }

    // Only applicable if using 'getStaticProps'
    if (revalidate) {
      result = { ...result, revalidate };
    }

    return result;
  };
}
