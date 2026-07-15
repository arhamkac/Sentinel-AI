export const askCopilot = (prompt: string) => {
  window.dispatchEvent(new CustomEvent('trigger-copilot', { detail: { prompt } }))
}
