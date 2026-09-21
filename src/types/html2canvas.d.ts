declare module 'html2canvas' {
  function html2canvas(element: HTMLElement, options?: object): Promise<HTMLCanvasElement>
  export default html2canvas
}
