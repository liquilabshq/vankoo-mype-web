# Imagen de producción de la web MYPE: se compila con Vite y la sirve nginx sin
# privilegios. Las variables VITE_* se fijan al compilar (Vite las incrusta en el
# JavaScript), por eso llegan como argumentos de construcción y no como variables
# de entorno del contenedor.
#
# VITE_PLATFORM_API_URL vacío = mismo origen: la web llama a /iam/api/..., /invoicing/api/...
# y el Ingress de Kubernetes las reparte al API Gateway (k8s/overlays/azure de
# vankoo-infra). Para apuntar a otro gateway: --build-arg VITE_PLATFORM_API_URL=https://...

FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .

ARG VITE_PLATFORM_API_URL=""
ARG VITE_SIGN_UP_ENDPOINT_PATH="/iam/api/v1/authentication/sign-up"
ARG VITE_SIGN_IN_ENDPOINT_PATH="/iam/api/v1/authentication/sign-in"
ARG VITE_FORGOT_PASSWORD_ENDPOINT_PATH="/iam/api/v1/authentication/forgot-password"
ARG VITE_RESET_PASSWORD_ENDPOINT_PATH="/iam/api/v1/authentication/reset-password"
ARG VITE_USERS_ENDPOINT_PATH="/iam/api/v1/users"
ARG VITE_AUCTIONS_ENDPOINT_PATH="/investment/api/v1/auctions"
ARG VITE_INVOICES_ENDPOINT_PATH="/invoicing/api/v1/invoices"
ARG VITE_COMPANY_ENDPOINT_PATH="/profile/api/v1/companies"
ARG VITE_FINANCE_ACCOUNTS_ENDPOINT_PATH="/finance/api/v1/accounts"
ARG VITE_RISK_ASSESSMENTS_ENDPOINT_PATH="/risk/api/v1/mype/risk-assessments"
ENV VITE_PLATFORM_API_URL=$VITE_PLATFORM_API_URL \
    VITE_SIGN_UP_ENDPOINT_PATH=$VITE_SIGN_UP_ENDPOINT_PATH \
    VITE_SIGN_IN_ENDPOINT_PATH=$VITE_SIGN_IN_ENDPOINT_PATH \
    VITE_FORGOT_PASSWORD_ENDPOINT_PATH=$VITE_FORGOT_PASSWORD_ENDPOINT_PATH \
    VITE_RESET_PASSWORD_ENDPOINT_PATH=$VITE_RESET_PASSWORD_ENDPOINT_PATH \
    VITE_USERS_ENDPOINT_PATH=$VITE_USERS_ENDPOINT_PATH \
    VITE_AUCTIONS_ENDPOINT_PATH=$VITE_AUCTIONS_ENDPOINT_PATH \
    VITE_INVOICES_ENDPOINT_PATH=$VITE_INVOICES_ENDPOINT_PATH \
    VITE_COMPANY_ENDPOINT_PATH=$VITE_COMPANY_ENDPOINT_PATH \
    VITE_FINANCE_ACCOUNTS_ENDPOINT_PATH=$VITE_FINANCE_ACCOUNTS_ENDPOINT_PATH \
    VITE_RISK_ASSESSMENTS_ENDPOINT_PATH=$VITE_RISK_ASSESSMENTS_ENDPOINT_PATH
# --mode production: lee .env.production solo para lo que no llega por argumento
# (los argumentos de arriba ganan, porque ya son variables de entorno).
RUN pnpm build

# nginx sin privilegios: escucha en el 8080 y corre con el usuario 101.
FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
