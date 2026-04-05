FROM node:20-alpine AS deps

# Required by some native node modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy only the files needed to install dependencies first.
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

RUN npm install


FROM node:20-alpine AS builder

WORKDIR /app

# Copy the rest of the source code
COPY . .

COPY --from=deps /app/node_modules ./node_modules

RUN npm run build


FROM nginx:alpine AS runner

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]