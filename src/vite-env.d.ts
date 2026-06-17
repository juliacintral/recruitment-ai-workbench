/// <reference types="vite/client" />

// Declara módulos de imagem para o TypeScript não reclamar do import
declare module '*.png' {
  const src: string
  export default src
}
declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.jpeg' {
  const src: string
  export default src
}
