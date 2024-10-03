# lcap-template
> Low-code application templates

## Project Structure
```
|-- root
  |-- packages
      |-- basic // pure function package
      |-- core // General vue framework basic package
      |-- pc // PC client business package
      |-- h5 // h5 end business package
```

## Environment Dependencies
- nodejs 18
- pnpm 8

## Install Dependencies
> In the project root directory
```
pnpm install
```

## Publish Static Resources Locally
> Under the root directory
```
pnpm build

pnpm run deploy --platform a --username b --password c
```

## How to modify the version number
> Under the root directory
```
pnpm change:version --version 1.0.0
```
