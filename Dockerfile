FROM node:22.7.0-alpine

# Set arguments and environment variables
ARG USERNAME="node"
ARG APP_PORT="3001"
ARG PM2_VERSION="5.4.2"
ARG COLOR=green

# Set Environment Variables
ENV BG_COLOR=$COLOR
ENV PORT=$APP_PORT

# Create app directory and set permissions
RUN mkdir -p /home/node/app/node_modules && \
    chown -R $USERNAME:$USERNAME /home/node/app

# Install PM2 globally
RUN npm install -g pm2@$PM2_VERSION

# Set working directory
WORKDIR /home/node/app

# Use non-root user
USER node

# Copy only package.json and package-lock.json (if available)
COPY --chown=$USERNAME:$USERNAME package* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code and static files
COPY --chown=$USERNAME:$USERNAME . .

EXPOSE $APP_PORT
# Define the entrypoint for the container
ENTRYPOINT [ "pm2-runtime", "npm", "--" ]
CMD ["start"]
