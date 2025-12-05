import { GoogleGenAI, Type, Schema, Modality, LiveServerMessage } from "@google/genai";
import { QuizQuestion, ScanResult, QuestionType } from "../types";

// Helper to get AI instance
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean JSON strings from Markdown fences
const cleanJSON = (text: string): string => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// --- SCANNER SERVICE (Vision -> JSON) ---

export const analyzeNotesAndCreateQuiz = async (base64Image: string, mimeType: string): Promise<ScanResult> => {
  const ai = getAI();
  
  const prompt = `
    Analiza esta imagen de apuntes o tarea escolar.
    1. Identifica el título o tema principal.
    2. Genera un resumen conciso en español.
    3. Crea EXACTAMENTE 5 preguntas de repaso basadas en el contenido.
       - IMPORTANTE: Debes mezclar tipos de preguntas.
       - Genera 3 preguntas de 'MULTIPLE_CHOICE' (Opción Múltiple).
       - Genera 2 preguntas de 'SHORT_ANSWER' (Respuesta Corta) que requieran que el estudiante escriba una frase o palabra clave.
    
    Responde estrictamente en JSON usando este esquema.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // High intelligence for handwriting analysis
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: [QuestionType.MULTIPLE_CHOICE, QuestionType.SHORT_ANSWER] },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array de 4 opciones si es multiple choice, null si es short answer" },
                correctAnswer: { type: Type.INTEGER, description: "Índice de la opción correcta (0-3) para multiple choice" },
                answerKey: { type: Type.STRING, description: "La respuesta ideal correcta para preguntas de respuesta corta" },
                explanation: { type: Type.STRING, description: "Explicación educativa de por qué es la respuesta correcta" }
              }
            }
          }
        }
      }
    }
  });

  if (response.text) {
    try {
        const cleanText = cleanJSON(response.text);
        const data = JSON.parse(cleanText);
        return {
        ...data,
        id: Date.now().toString(),
        date: new Date()
        } as ScanResult;
    } catch (e) {
        console.error("JSON Parse Error:", e, response.text);
        throw new Error("Error al procesar la respuesta de la IA.");
    }
  }
  throw new Error("No se pudo generar el cuestionario.");
};

// --- CHAT SERVICE (Text & Thinking) ---

export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string, useThinking: boolean = false) => {
  const ai = getAI();
  
  const config: any = {
    systemInstruction: "Eres un tutor experto y motivador. Ayudas a los estudiantes a entender conceptos difíciles. Responde siempre en ESPAÑOL. Sé claro, conciso y amigable.",
  };

  let model = 'gemini-3-pro-preview';

  if (useThinking) {
    // Enable thinking for complex queries
    config.thinkingConfig = { thinkingBudget: 16000 }; 
  }

  const chat = ai.chats.create({
    model: model,
    config: config,
    history: history
  });

  const result = await chat.sendMessageStream({ message });
  return result;
};

// --- AUDIO/LIVE API HELPERS ---

// Basic PCM Encoding/Decoding
function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function base64ToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export class LiveSessionClient {
  private ai: GoogleGenAI;
  private session: any = null;
  private audioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private isConnected = false;
  
  public onAudioData: ((data: ArrayBuffer) => void) | null = null;
  public onTranscript: ((text: string, type: 'user' | 'model') => void) | null = null;

  constructor() {
    this.ai = getAI();
  }

  async connect() {
    if (this.isConnected) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Connect to Live API
    const sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        systemInstruction: "Eres un compañero de estudio entusiasta y servicial. Habla en ESPAÑOL. Mantén las respuestas breves y atractivas. Si el estudiante se equivoca, corrígelo amablemente.",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      },
      callbacks: {
        onopen: async () => {
          console.log("Live API Connected");
          this.isConnected = true;
          await this.startMicrophone(sessionPromise);
        },
        onmessage: (msg: LiveServerMessage) => {
          // Handle Audio
          const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData && this.onAudioData) {
            this.onAudioData(base64ToArrayBuffer(audioData));
          }

          // Handle Transcriptions
          if (msg.serverContent?.inputTranscription?.text && this.onTranscript) {
             this.onTranscript(msg.serverContent.inputTranscription.text, 'user');
          }
          if (msg.serverContent?.outputTranscription?.text && this.onTranscript) {
            this.onTranscript(msg.serverContent.outputTranscription.text, 'model');
          }
        },
        onclose: () => {
          console.log("Live API Closed");
          this.isConnected = false;
        },
        onerror: (err) => {
          console.error("Live API Error", err);
          this.isConnected = false;
        }
      }
    });
    
    this.session = sessionPromise;
  }

  private async startMicrophone(sessionPromise: Promise<any>) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        sampleRate: 16000,
        channelCount: 1
      }});
      
      const inputContext = new AudioContext({ sampleRate: 16000 });
      this.inputSource = inputContext.createMediaStreamSource(stream);
      this.processor = inputContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert Float32 to Int16 PCM
        const buffer = new ArrayBuffer(inputData.length * 2);
        const view = new DataView(buffer);
        floatTo16BitPCM(view, 0, inputData);
        
        const base64Pcm = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        
        sessionPromise.then(session => {
            session.sendRealtimeInput({
                media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Pcm
                }
            });
        });
      };

      this.inputSource.connect(this.processor);
      this.processor.connect(inputContext.destination);

    } catch (error) {
      console.error("Mic access denied", error);
    }
  }

  async disconnect() {
    if (this.session) {
       // Close not directly available on promise, but implies cleanup
    }
    if (this.inputSource) this.inputSource.disconnect();
    if (this.processor) this.processor.disconnect();
    if (this.audioContext) this.audioContext.close();
    this.isConnected = false;
  }
}

// --- CREATIVE STUDIO SERVICES ---

export const generateImage = async (prompt: string, resolution: string, aspectRatio: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        imageSize: resolution as any,
        aspectRatio: aspectRatio as any
      }
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const editImage = async (base64Image: string, prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image', // Nano Banana
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/png' } },
        { text: prompt }
      ]
    }
  });

   // Extract image
   for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateVideo = async (prompt: string, aspectRatio: string = '16:9') => {
  const ai = getAI();
  
  // Note: Assuming a valid paid key is selected via window.aistudio flow in UI
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio as any
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (uri) {
      // Append key for fetching
      return `${uri}&key=${process.env.API_KEY}`;
  }
  throw new Error("Video generation failed");
};

// --- SEARCH & GROUNDING ---

export const groundSearch = async (query: string) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
            tools: [{ googleSearch: {} }]
        }
    });
    
    return {
        text: response.text,
        chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
};

export const groundMaps = async (query: string, lat: number, lng: number) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
                retrievalConfig: {
                    latLng: { latitude: lat, longitude: lng }
                }
            }
        }
    });
    return {
        text: response.text,
        chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
};
