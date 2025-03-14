# Build image
FROM node:22.10.0 AS build
# Set container working directory to /app
WORKDIR /app
# Copy npm instructions
COPY package*.json ./
# Install dependencies with npm ci (exact versions in the lockfile)
RUN npm ci
# Copy app (useless stuff is ignored by .dockerignore)
COPY . .
# Build the app
RUN npm run build
# Delete all non-production dependencies to make copy in line 28 more efficient
RUN npm prune --production

# Production image
FROM node:22.10.0-alpine
# Set the env to "production"
ENV NODE_ENV=production
# Set npm cache to a directory the non-root user can access
RUN npm config set cache /app/.npm-cache --global
# Create the app directory and set proper ownership
RUN mkdir -p /app && chown -R node:node /app
# Get non-root user
USER node
# Set container working directory to /app
WORKDIR /app
# Copy necessary files
COPY --chown=node:node --from=build /app/package*.json ./
COPY --chown=node:node --from=build /app/.next ./.next
COPY --chown=node:node --from=build /app/public ./public
COPY --chown=node:node --from=build /app/node_modules ./node_modules
# Expose port
EXPOSE 3000
# Start app using Next.js server
CMD ["npm", "start"]
