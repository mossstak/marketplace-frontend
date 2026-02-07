FROM node:22-slim AS base
ARG PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS dependencies

COPY package.json package-lock.json ./
RUN npm ci

FROM  base AS build

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

RUN npm run build

FROM base AS run

ENV PORT=$PORT

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json

COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules

USER nextjs
EXPOSE $PORT
ENV HOSTNAME="0.0.0.0"
CMD ["npm", "run", "start"]