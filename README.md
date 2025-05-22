# Pomodoro Time Tracking app

## Group 11 (SOPRA fs-25)

One Paragraph of project description goes here ...

## Built With

- [NextJS](https://nextjs.org/) - The TS frontend framework
- [Vercel](https://vercel.com/) - Deployment platform
- [npm](https://www.npmjs.com/) - Node package manager
- [Ant design componenets](https://ant.design/) - Componenets library

## High level components

...

## Launch & deployment

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

1. Clone the repo locally:

```bash
git clone git@github.com:luciocanepa/SOPRA_group11_client.git
```

2. make sure you have [node.js](https://nodejs.org/en) installed

```bash
node -v
```

3. npm comes together with the installation of node:

```bash
npm -v
```

3. install all packages locally:

```bash
npm install
```

4. you can build or run the application locally (dev) using nextJS framework:

```bash
npm run build
```

```bash
npm run dev
```

5. The app has 3 worklflows for deployment:

- `build.yml`: Run the NextJS builder and generate pages
- `verceldeployment.yml`: after build, send the pages over to vercel to expose them at [https://sopra-fs25-group-11-client.vercel.app/](https://sopra-fs25-group-11-client.vercel.app/)
- `dockerize.yml`: workflow that creates the docker container for the application

## Illustations

...

## Roadmap

...

## Authors

| Name | Email | Matriculation Number | GitHub Account |
|------|--------|-------------------|----------------|
| Lucio Canepa (group leader) | <lucio.canepa@uzh.ch> | 21-915-905 | luciocanepa |
| Anna Pang | <anna.pang@uzh.ch> | 17-968-660 | annapangUZH |
| Sharon Kelly Isler | <sharonkelly.isler@uzh.ch> | 19-757-103 | sharonisler |
| Moritz Leon Böttcher | <moritzleon.boettcher@uzh.ch> | 23-728-371 | moritzboet |
| Helin Capan | <helin.capan@uzh.ch> | 21-718-895 | HelinCapan |

## License

MIT License

Copyright (c) 2025 SOPRA-fs-25-group-11

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc
