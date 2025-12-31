import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para mostrar el UI alternativo después de un error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Puedes enviar el error a un servicio de reportes de errores
    console.error("Error capturado en ErrorBoundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Renderizar cualquier UI de fallback (pantalla de error)
      return <h1>Ocurrió un error. Por favor, inténtalo de nuevo más tarde.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
