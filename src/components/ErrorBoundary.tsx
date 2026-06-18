import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', gap: '16px',
          fontFamily: 'Inter, sans-serif', color: '#172033', background: '#f5f7fb'
        }}>
          <div style={{ fontSize: '28px' }}>⚠️</div>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>Algo deu errado</div>
          <div style={{
            background: '#fff0f0', border: '1px solid #fca5a5', borderRadius: '10px',
            padding: '12px 20px', fontSize: '13px', color: '#b42318', maxWidth: '600px',
            wordBreak: 'break-word', textAlign: 'center'
          }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#235cff', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '10px 24px', cursor: 'pointer', fontSize: '14px'
            }}
          >
            Recarregar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
