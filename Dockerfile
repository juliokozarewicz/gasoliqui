# Usar uma imagem base com Node.js
FROM node:18

# Criar e definir o diretório de trabalho
WORKDIR /app

# Copiar o package.json e o package-lock.json (ou yarn.lock)
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o restante do código da aplicação
COPY . .

# Compilar o código TypeScript
RUN npm run build

# Expor a porta que o NestJS usa (por padrão, 3000)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/src/main.js"]
