

const baseUrl = import.meta.env.VITE_API_BACK_URL || '';

// export const pdfService = async ( apikey: string, documentId: string ) => {
//     try {
//         const response = await fetch(`${baseUrl}/generatePdf`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             },
//             body: JSON.stringify({
//                 apiKey: apikey,
//                 documentId: documentId
//             })
//         });
//         const data = await response.json();

//         console.log("data", data);

//         return data;
//     } catch (error) {
//         console.error(error);
//     }
// }

export const pdfService = async (apiKey: string, documentId: string) => {
    try {
        const token = localStorage.getItem("token");
        const url = `${baseUrl}/api/pdf/generatePdf`;
        
        // 1. Encolar el trabajo - esto responde INMEDIATAMENTE con un jobId
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                apiKey: apiKey,
                documentId: documentId
            })
        });
        
        const data = await response.json();
        console.log("📦 Trabajo encolado:", data);
        
        // 2. Si hay error, lo manejamos
        if (!response.ok) {
            throw new Error(data.error || 'Error al encolar PDF');
        }
        
        // 3. Ahora necesitamos ESCUCHAR el resultado via SSE
        // Devolvemos el jobId para que quien llame a esta función pueda conectarse al SSE
        return {
            success: true,
            jobId: data.jobId,
            sseUrl: data.sseUrl,
            message: 'PDF encolado, esperando resultado...'
        };
        
    } catch (error) {
        console.error("❌ Error en pdfService:", error);
        throw error;
    }
}

export const pdfServiceByGroup = async (apiKey: string, id: string, stage: string, data: Record<string, any>) => {
    try {
        const token = localStorage.getItem("token");
        console.log(`📤 Encolando PDF para grupo: ${id}, stage: ${stage}`);

        const response = await fetch(`${baseUrl}/api/pdf/generatePdfByGroup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ apiKey, id, stage, data })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al encolar PDF por grupo');
        }

        return {
            success: true,
            jobId: result.jobId,
            sseUrl: result.sseUrl,
            message: 'PDF encolado, esperando resultado...'
        };

    } catch (error) {
        console.error("❌ Error en pdfServiceByGroup:", error);
        throw error;
    }
}


// En tu código, ahora harías:
export const generarMiPDF =  async (apiKey: string, documentId: string) => {
    try {
        // PASO 1: Encolar
        const result = await pdfService(apiKey, documentId);
        
        if (result.success) {
            console.log('PDF encolado con ID:', result.jobId);
            
            // PASO 2: Escuchar el resultado
            listenForPDF(result.jobId, {
                onProgress: (progreso) => {
                    console.log(`Progreso: ${progreso.porcentaje}%`);
                },
                onComplete: (pdfBase64) => {
                    console.log('¡PDF recibido!');
                    // Hacer algo con el PDF, por ejemplo:
                    const link = document.createElement('a');
                    link.href = `data:application/pdf;base64,${pdfBase64}`;
                    link.download = 'documento.pdf';
                    link.click();
                },
                onError: (error) => {
                    console.error('Error generando PDF:', error);
                }
            });
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}


// Función para escuchar el resultado via SSE
export const listenForPDF = (jobId: string, callbacks: {
    onProgress?: (data: any) => void,
    onComplete?: (pdfBase64: string) => void,
    onError?: (error: any) => void
}) => {
    
    const eventSource = new EventSource(`${baseUrl}/api/sse/pdf-status/${jobId}`);
    
    eventSource.addEventListener('progreso', (event) => {
        const data = JSON.parse(event.data);
        console.log("📊 Progreso:", data);
        if (callbacks.onProgress) callbacks.onProgress(data);
    });
    
    eventSource.addEventListener('completado', (event) => {
        const data = JSON.parse(event.data);
        console.log("✅ PDF listo!");
        if (callbacks.onComplete) callbacks.onComplete(data.pdfBase64);
        eventSource.close();
    });
    
    eventSource.addEventListener('error', (event) => {
        const data = JSON.parse(event.data);
        console.error("❌ Error:", data);
        if (callbacks.onError) callbacks.onError(data);
        eventSource.close();
    });
    
    eventSource.onerror = (error) => {
        console.error("🔌 Error de conexión SSE:", error);
        eventSource.close();
    };
    
    // Devolvemos el eventSource por si quieren cerrarlo manualmente
    return eventSource;
};