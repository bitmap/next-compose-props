# next-compose-props

Compose multiple Next.js `getStaticProps` or `getServerSideProps` functions.

## Install

```sh
npm install next-compose-props
```

`next-compose-props` has a peer dependency of `next@^10.0.0`.

## Usage

`next-compose-props` allows you to compose multiple [data-fetching methods](https://nextjs.org/docs/basic-features/data-fetching) for pre-rendering pages.

Export a `getStaticProps` or `getServerSideProps` function from your page that is mapped to `composeProps`.

```ts
import { composeProps } from "next-compose-props";

export const getStaticProps = composeProps(foo, bar, baz)
```
You supply any number of async functions that return props. These are the same function that you would normally return, and the page context is passed to each one.

```ts
// lib/api
export const getFoo: GetStaticProps = async ({ params }) => {
  const res = await fetch(`/api/foo/${params.id}`);
  const foo = await res.json();

  return {
    props: {
      foo,
    },
  };
};

export const getBar: GetStaticProps = async () => {
  const res = await fetch("/api/bar");
  const bar = await res.json();

  return {
    props: {
      bar
    },
  };
};
```

And export an async `getStaticProps` or `getServerSideProps` function on your pages like you usually would. Each props object is merged into one.

```tsx
// pages/foo/[id].js
import { composeProps } from "next-compose-props";
import { getFoo, getBar } from "lib/api";

function Page({ foo, bar }) {
  return (
    <main>
      {/* Use props like usual */}
    </main>
  );
}

export const getStaticProps = composeProps(
  getFoo,
  getBar,
);

export default Page;
```

While these examples show `getStaticProps`, the process is exactly the same for `getServerSideProps`.

### `redirect` and `notFound`

If one of your composed functions returns a `redirect` or `notFound`, it will take precedence and immediately return.

```ts
export const getFoo: GetStaticProps = async ({ params }) => {
  const res = await fetch(`/api/foo/${params.id}`);
  const foo = await res.json();

  if (!foo) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {
      foo,
    },
  };
};
```

### `revalidate`

If one or more of your functions returns a `revalidate` property to opt into [Incremental Static Regeneration](https://nextjs.org/docs/basic-features/data-fetching#incremental-static-regeneration), the last resolved value will be passed. This only applies to `getStaticProps`.

# License

[MIT](https://github.com/bitmap/next-compose-props/blob/master/LICENSE)
