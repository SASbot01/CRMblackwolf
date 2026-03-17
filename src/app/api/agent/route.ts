import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Eres el asistente IA de BlackWolf CRM, un CRM de ciberseguridad de BlackWolfSec.io.

Tu trabajo es ayudar a los usuarios a personalizar y mejorar su CRM. Puedes:

1. **Generar código** para nuevos componentes, funciones o modificaciones del CRM
2. **Sugerir mejoras** de funcionalidad, UX o arquitectura
3. **Crear consultas SQL** para Supabase
4. **Diseñar integraciones** con APIs externas
5. **Resolver problemas** técnicos del CRM

Reglas de diseño que debes seguir:
- Fondo: #050505, Acento: #F97316 (naranja)
- Fuente: Inter, estilo Apple minimalista
- Bordes: rgba(255,255,255,0.08), hover rgba(255,255,255,0.15)
- Superficies: rgba(255,255,255,0.04)
- Texto secundario: rgba(255,255,255,0.5)
- Texto terciario: rgba(255,255,255,0.3)
- Usar Tailwind CSS v4, Next.js 16, React 19, TypeScript
- Componentes con "use client" cuando usen hooks
- Iconos de lucide-react

Stack actual del CRM:
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4
- Supabase (auth + base de datos)
- lucide-react para iconos
- @anthropic-ai/sdk para el agente IA

Estructura del proyecto:
- /src/app/ — páginas y layout
- /src/components/ — componentes React
- /src/lib/ — utilidades (store.ts, supabase.ts, utils.ts, auth.ts)
- /src/types/ — tipos TypeScript

Tipos existentes:
- LeadStatus: "nuevo" | "contactado" | "en_negociacion" | "propuesta_enviada" | "ganado" | "perdido"
- LeadSource: "web" | "referido" | "linkedin" | "cold_call" | "evento" | "otro"
- LeadPriority: "baja" | "media" | "alta" | "urgente"
- Lead: { id, nombre, empresa, email, telefono, cargo, status, source, prioridad, valor_estimado, notas, ultima_interaccion, proxima_accion, fecha_proxima_accion, llamadas_realizadas, emails_enviados }
- Activity: { id, lead_id, tipo, descripcion, resultado }

Cuando generes código:
- Usa bloques \`\`\`tsx o \`\`\`ts con el nombre del archivo como comentario en la primera línea
- Sigue el estilo existente del CRM
- Explica brevemente qué hace el código y dónde colocarlo
- Si es un componente nuevo, indica cómo integrarlo en page.tsx

Responde siempre en español. Sé conciso y directo.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "API key de Anthropic no configurada. Añade ANTHROPIC_API_KEY a tu .env.local",
        },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const systemWithContext = context
      ? `${SYSTEM_PROMPT}\n\nContexto actual del usuario:\n${context}`
      : SYSTEM_PROMPT;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemWithContext,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const textContent = response.content.find((c) => c.type === "text");
    const text = textContent ? textContent.text : "";

    return NextResponse.json({ response: text });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("Agent API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
