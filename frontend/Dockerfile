FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Run the development server exposing all hosts
CMD ["npm", "run", "dev", "--", "--host"]
