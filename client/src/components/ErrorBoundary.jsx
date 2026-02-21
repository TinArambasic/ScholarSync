import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Nešto je pošlo naopako</h1>
            <p className="text-gray-600 mb-4">Došlo je do greške pri učitavanju stranice.</p>
            <details className="mb-4 p-3 bg-gray-50 rounded-lg">
              <summary className="font-semibold text-gray-700 cursor-pointer">Detalji greške</summary>
              <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Vratite se na početnu stranicu
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
