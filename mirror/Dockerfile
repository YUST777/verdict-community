FROM ghcr.io/puppeteer/puppeteer:24.1.1

WORKDIR /app

# Switch to root to install dependencies if needed, or stick to pptruser
# The base image creates a 'pptruser'. We should use it or root?
# The image sets USER pptruser by default.
USER root

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Switch back to non-root user for security
USER pptruser

CMD ["node", "server.js"]
