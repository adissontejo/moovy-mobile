# Moovy

Este aplicativo faz parte de um desafio fullstack cujo objetivo é salvar filmes na biblioteca e poder adicionar reviews de áudio nos filmes salvos. É pelo aplicativo que é disponibilizada a funcionalidade de gravar as reviews dos filmes e ouvir as reviews gravadas.

## Executando o projeto

Para executar o projeto, você precisará ter o NodeJS e o (React Native CLI)[https://reactnative.dev/docs/environment-setup] instalado, junto com suas dependências especificadas no site. Além disso, você deve também ter o projeto (moovy-server)[https://github.com/adissontejo/moovy-server] em execução, uma vez que esse é o servidor que o aplicativo utiliza.

Após isso, você deve copiar o conteúdo do arquivo .env.sample e colar em um novo arquivo na raíz do projeto chamado .env, alterando o valor da variável de ambiente API_URL para a URL da API do servidor em execução.

Por fim, instale as dependências do projeto utilizando yarn e rode o projeto para o sistema operacional adequado com os seguintes comandos:

```sh
yarn
```

### Android

```sh
yarn android
```

### IOS

```sh
yarn ios
```
