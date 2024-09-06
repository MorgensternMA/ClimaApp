# Usa la imagen base oficial de Node.js
FROM node:18-alpine

# Define el puerto en el que la aplicación escuchará
EXPOSE 1993

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias a la imagen y realiza la instalación de las mismas
COPY package*.json ./
RUN npm install --production

# Copia el resto de los archivos de la aplicación al contenedor
COPY . .

# Compila el código TypeScript a JavaScript
RUN npm run build

# Define el comando para iniciar la aplicación utilizando el archivo compilado
CMD ["node", "dist/index.js"]
