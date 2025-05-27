FROM node:alpine as build

COPY package.json package.json
RUN npm install
COPY . .
RUN npm build

FROM nginx:stable-alpine

COPY --from=build /dist /usr/share/nginx/htlm
COPY --from=build nginx.conf /etc/nginx/comf.d/default.conf
EXPOSE 5174
CMD [ "nginx", "-g", "daemon off;" ]