FROM node:22.12.0 AS base
WORKDIR /app
RUN npm config set update-notifier false

FROM base AS dev
CMD exec /bin/bash -c "npm install && npm run dev"

FROM base AS build
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY public public
COPY src src
COPY .postcssrc.json .
COPY env.d.ts .
COPY index.html .
COPY tailwind.config.ts .
COPY tsconfig.app.json .
COPY tsconfig.json .
COPY tsconfig.node.json .
COPY vite.config.ts .
RUN npm run build

FROM scratch AS dist
COPY --from=build /app/dist /