# Stage 1: ติดตั้ง Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else npm i; \
  fi

# Stage 2: Build แอปพลิเคชัน
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# ENV NEXT_TELEMETRY_DISABLED 1 (ถ้าไม่ต้องการส่งข้อมูลให้ Vercel)

# คำสั่ง Build สำหรับ Next.js
RUN npm run build

# Stage 3: Production Image (ขั้นตอนสุดท้าย)
# ใช้ Base Image ที่เล็กและปลอดภัย
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED 1

# สร้าง user เฉพาะสำหรับรันแอป เพื่อความปลอดภัย
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# คัดลอกไฟล์ที่ Build แล้วจาก Stage ก่อนหน้า
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# คำสั่งสำหรับรันแอปพลิเคชัน
CMD ["node", "server.js"]