# eCodicesNL Browser

This is the front-end for the manuscript browser of eCodicesNL.

It is a [Vite](https://vite.dev) + React application built on top of
[`@knaw-huc/panoptes-react`](https://www.npmjs.com/package/@knaw-huc/panoptes-react); it talks to a
Panoptes search API and renders the results.

## Requirements

- Node.js `^20.19.0 || >=22.12.0` (as required by Vite 8; developed against Node 24)
- npm

## Getting started

```shell
npm install
cp .env.example .env
npm run dev
```

The dev server runs on <http://localhost:5173>. Opening `/` redirects to the configured search path
(`/search` by default).

## Configuration

The app is configured through `VITE_`-prefixed environment variables. For local development these are
read from a `.env` file in the project root; `.env.example` holds sensible defaults.

| Variable                     | Required | Description                                                                                            |
|------------------------------|----------|--------------------------------------------------------------------------------------------------------|
| `VITE_PANOPTES_URL`          | yes      | Base URL of the Panoptes API, e.g. `https://api.ecodices.nl`                                             |
| `VITE_PANOPTES_DATASET`      | yes      | Dataset to browse, e.g. `ecodices`                                                                       |
| `VITE_PANOPTES_SEARCH_PATH`  | yes      | Path of the search screen, e.g. `/search`. May contain `$dataset`, which is replaced by the dataset name. |
| `VITE_PANOPTES_IS_EMBEDDED`  | yes      | `true` when the app is embedded in another site, `false` otherwise                                       |
| `VITE_PANOPTES_DETAIL_PATH`  | no       | Path of the detail screen; omit to use the Panoptes default                                              |

## Scripts

| Command           | Description                                             |
|-------------------|---------------------------------------------------------|
| `npm run dev`     | Start the dev server with hot module replacement        |
| `npm run build`   | Type-check (`tsc -b`) and build for production to `dist/` |
| `npm run preview` | Serve the production build locally                      |
| `npm run lint`    | Run ESLint over the project                             |

## Docker

The `Dockerfile` builds the app and serves `dist/` with nginx:

```shell
docker build -t ecodices-panoptes .
docker run --rm -p 8080:80 \
  -e VITE_PANOPTES_URL=https://api.ecodices.nl \
  -e VITE_PANOPTES_DATASET=ecodices \
  -e VITE_PANOPTES_SEARCH_PATH=/search \
  -e VITE_PANOPTES_IS_EMBEDDED=false \
  ecodices-panoptes
```

The app is then available on <http://localhost:8080>.

Note that the image is configured at *run* time, not at build time: `src/main.tsx` contains literal
`$VITE_…` placeholders, and `deployment/entrypoint.sh` substitutes the environment variables into the
built JavaScript with `envsubst` before starting nginx. This means one image can be deployed against
different APIs and datasets. During development the same placeholders are resolved from `import.meta.env`
instead, so `.env` is what applies there.