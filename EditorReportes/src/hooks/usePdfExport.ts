import { pdfService, pdfServiceByGroup } from "../services/pdf.service";
import Swal from "sweetalert2";

type ExportOptions = {
  data?: Record<string, any>;
  stage?: string;
};

const listenSse = (requestPdf: any, cleanup: () => void, mostrarPDF: (url: string) => void) => {
  let completed = false;
  const baseUrl = import.meta.env.VITE_API_BACK_URL || '';
  const eventSource = new EventSource(`${baseUrl}/api/sse/pdf-status/${requestPdf.jobId}`);

  eventSource.addEventListener('connected', (event) => {
    const data = JSON.parse(event.data);
    console.log('✅ Conectado al servidor SSE:', data);
  });

  eventSource.addEventListener('progreso', (event) => {
    const data = JSON.parse(event.data);
    console.log(`📊 Progreso:`, data);
    Swal.update({
      title: 'Generando PDF...',
      html: `
        <div style="text-align: left;">
          <div>${data.etapa || 'Procesando...'}</div>
          <div style="margin-top: 10px;">
            <div style="background: #eee; border-radius: 4px; height: 20px; width: 100%;">
              <div style="background: #3085d6; width: ${data.porcentaje || 0}%; height: 100%; border-radius: 4px; transition: width 0.3s;"></div>
            </div>
            <div style="margin-top: 5px;">${data.porcentaje || 0}%</div>
          </div>
          ${data.mensaje ? `<div style="margin-top: 10px; color: #666;">${data.mensaje}</div>` : ''}
        </div>
      `
    });
  });

  eventSource.addEventListener('completado', (event) => {
    const data = JSON.parse(event.data);
    console.log('✅ Completado:', data);
    completed = true;
    cleanup();
    eventSource.close();
    Swal.close();

    if (data.pdfBase64) {
      mostrarPDF(data.url);
    } else if (data.slug) {
      const downloadUrl = `${baseUrl}/api/pdf/v/${data.slug}`;
      mostrarPDF(downloadUrl);
    }
  });

  eventSource.addEventListener('error', (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    console.error('❌ Error:', data);
    completed = true;
    cleanup();
    eventSource.close();
    Swal.close();
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: data.message || "Error generando PDF"
    });
  });

  eventSource.onerror = (error) => {
    if (completed) return;
    console.error('🔌 Error de conexión SSE:', error);
    eventSource.close();
    Swal.close();
    alert(`🔌 Error de conexión SSE\nNo se pudo conectar a:\n${baseUrl}/api/sse/pdf-status/${requestPdf.jobId}`);
    Swal.fire({
      icon: 'error',
      title: 'Error de conexión',
      text: 'Se perdió la conexión con el servidor'
    });
  };

  return eventSource;
};

export const usePdfExport = () => {
  const handleExportPdf = async (apiKey: string, documentId: string) => {
    Swal.fire({
      title: 'Generando PDF...',
      html: 'Iniciando proceso...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      showConfirmButton: false
    });

    try {
      const requestPdf = await pdfService(apiKey, documentId);

      if (!requestPdf.success || !requestPdf.jobId) {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: requestPdf.message || "No se pudo encolar el PDF"
        });
        return;
      }

      console.log(`📦 Trabajo encolado con ID: ${requestPdf.jobId}, conectando SSE...`);
      
      const timeoutId = setTimeout(() => {
          Swal.close();
          Swal.fire({
              icon: 'error',
              title: 'Tiempo agotado',
              text: 'La generación del PDF tomó demasiado tiempo'
          });
      }, 120000);

      const cleanup = () => {
          clearTimeout(timeoutId);
      };

      listenSse(requestPdf, cleanup, mostrarPDF);

    } catch (error: any) {
      console.error("Error:", error);
      Swal.close();
      alert(`❌ Error handleExportPdf:\n${error.message || "Error inesperado"}`);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || "Error inesperado"
      });
    }
  };

  const handleExportPdfByGroup = async (apiKey: string, id: string, stage: string, data: Record<string, any>) => {
    Swal.fire({
      title: 'Generando PDF...',
      html: 'Iniciando proceso...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      showConfirmButton: false
    });

    try {
      const requestPdf = await pdfServiceByGroup(apiKey, id, stage, data);

      if (!requestPdf.success || !requestPdf.jobId) {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: requestPdf.message || "No se pudo encolar el PDF"
        });
        return;
      }

      const timeoutId = setTimeout(() => {
          Swal.close();
          Swal.fire({
              icon: 'error',
              title: 'Tiempo agotado',
              text: 'La generación del PDF tomó demasiado tiempo'
          });
      }, 120000);

      const cleanup = () => {
          clearTimeout(timeoutId);
      };

      listenSse(requestPdf, cleanup, mostrarPDF);

    } catch (error: any) {
      console.error("Error:", error);
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || "Error inesperado"
      });
    }
  };

  const mostrarPDF = (url: string) => {
    Swal.fire({
      // title: 'PDF Generado',
      width: '90%',
      html: `
        <div style="position: relative; width: 100%; height: 80vh;">
          <iframe 
            src="${url}" 
            style="width: 100%; height: 100%; border: none;"
            title="PDF Preview"
          ></iframe>
          <div style="margin-top: 15px; text-align: center;">
            <a 
              href="${url}" 
              target="_blank"
              class="swal2-confirm swal2-styled"
              style="text-decoration: none; display: inline-block; margin-right: 10px;"
            >
              Ver en nueva pestaña
            </a>
            <a 
              href="${url}" 
              download="documento.pdf"
              class="swal2-confirm swal2-styled"
              style="text-decoration: none; display: inline-block; background: #28a745;"
            >
              Descargar PDF
            </a>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true
    });
  };


  return { handleExportPdf, handleExportPdfByGroup };
};
